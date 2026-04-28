import assembly from "../models/assemblyModel.js";
import electronical from "../models/electronicalModel.js";
import mechanical from "../models/mechanicalModel.js";
import product from "../models/productModel.js";
import productTreeStructure from "../models/productTreeStructure.js";
import { ACTIVE_TREE, INACTIVE_TREE } from "../constants/productStatus.js";
import FailureRatePrediction from "../models/failureRatePredictionModel.js";
import mttrPrediction from "../models/mttrPredictionModel.js";
import project from "../models/projectModel.js";
import mongoose from "mongoose";

/**
 * =========================================================
 * ✅ Helpers (pure traversal + minimal DB writes)
 * =========================================================
 */

function toStrId(v) {
  return v?.toString?.() ?? String(v);
}

function isActive(node) {
  return node?.status === ACTIVE_TREE || node?.status === "active";
}

function ensureChildren(node) {
  if (!Array.isArray(node.children)) node.children = [];
  return node.children;
}

function findNodeById(node, targetId) {
  if (!node) return null;
  if (toStrId(node.id) === toStrId(targetId)) return node;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

function collectNodesDFS(root, { onlyActive = false } = {}) {
  const out = [];
  (function walk(n) {
    if (!n) return;
    if (!onlyActive || isActive(n)) out.push(n);
    if (Array.isArray(n.children)) {
      for (const c of n.children) walk(c);
    }
  })(root);
  return out;
}

function collectLeafNodes(root, { onlyActive = false } = {}) {
  const out = [];
  (function walk(n) {
    if (!n) return;
    const kids = Array.isArray(n.children) ? n.children : [];
    const isLeaf = kids.length === 0;
    if (isLeaf) {
      if (!onlyActive || isActive(n)) out.push(n);
      return;
    }
    for (const c of kids) walk(c);
  })(root);
  return out;
}

function countActiveChildren(node) {
  const kids = ensureChildren(node);
  return kids.filter((c) => isActive(c)).length;
}

async function updateTreeDoc(treeDocId, treeStructure) {
  return productTreeStructure.findByIdAndUpdate(
    treeDocId,
    { treeStructure },
    { new: true }
  );
}

/**
 * FRP Rate calc (kept identical logic, removed eval)
 */
function calcFrpRateFromPrediction(frpValue, qty) {
  if (!frpValue) return null;

  const field = frpValue.field != null ? parseFloat(frpValue.field) : null;
  const predicted =
    frpValue.predicted != null ? parseFloat(frpValue.predicted) : null;
  const allocated =
    frpValue.allocated != null ? parseFloat(frpValue.allocated) : null;
  const otherFr =
    frpValue.otherFr != null ? parseFloat(frpValue.otherFr) : null;
  const dutyCycle =
    frpValue.dutyCycle != null ? parseFloat(frpValue.dutyCycle) : null;

  const frOffsetOperand = frpValue.frOffsetOperand || 0;
  const failureRateOffset = frpValue.failureRateOffset || 0;

  // same branching as original (Field/Predicted/Allocated/Other)
  if (field && frpValue.source === "Field") {
    return field * qty * dutyCycle + frOffsetOperand + failureRateOffset;
  } else if (predicted && frpValue.source === "Predicted") {
    return predicted * qty * dutyCycle + frOffsetOperand + failureRateOffset;
  } else if (allocated && frpValue.source === "Allocated") {
    return allocated * qty * dutyCycle + frOffsetOperand + failureRateOffset;
  }
  return otherFr * qty * dutyCycle + frOffsetOperand + failureRateOffset;
}

/**
 * Recompute FR bottom-up for all active nodes:
 * - Leaf nodes keep their fr as-is
 * - Parent fr = sum(active children fr)
 * (kept same behavior as your loops, but deterministic in one pass)
 */
function recomputeFrBottomUp(root) {
  function dfs(node) {
    if (!node) return 0;
    const kids = ensureChildren(node);
    if (kids.length === 0) return node.fr || 0;

    let sum = 0;
    for (const c of kids) {
      if (!isActive(c)) continue;
      const childFr = dfs(c);
      if (c.fr) sum += c.fr;
      else sum += childFr || 0;
    }
    // original code only sets when >0 sometimes; here we preserve:
    // if any active child fr exists, set parent fr to sum; else keep.
    if (sum > 0) node.fr = sum;
    return node.fr || sum;
  }
  dfs(root);
}

/**
 * Recompute MTTR for Assembly nodes bottom-up:
 * - parent mttr = (Σ(fr_i * mct_i)) / (Σ(fr_i)) over active children with fr & mct
 * - root assembly mttr similarly computed over all active leaf nodes (your code did this too)
 * (kept same math, streamlined)
 */
async function recomputeMttrBottomUpAndPersistPredictions({
  treeRoot,
  projectId,
}) {
  // 1) bottom-up assembly mttr using direct children
  function dfs(node) {
    if (!node) return;
    const kids = ensureChildren(node);
    for (const c of kids) dfs(c);

    if (!isActive(node)) return;
    if (node.category !== "Assembly") return;
    if (kids.length === 0) return;

    let frMctTotalMul = 0;
    let frSum = 0;

    for (const c of kids) {
      if (!isActive(c)) continue;
      if (c.mct && c.fr) {
        frMctTotalMul += c.fr * c.mct;
        frSum += c.fr;
      }
    }
    const mttrVal = frSum > 0 ? frMctTotalMul / frSum : 0;
    if (mttrVal > 0) node.mttr = mttrVal;
  }

  dfs(treeRoot);

  // 2) persist mttrPrediction for ALL assembly nodes that have prediction rows
  const activeNodes = collectNodesDFS(treeRoot, { onlyActive: true }).filter(
    (n) => n.category === "Assembly"
  );

  // bulk-ish updates (still safe; same functionality, fewer round trips)
  for (const n of activeNodes) {
    const mttrIdData = await mttrPrediction.findOne({
      projectId,
      productId: n.id,
    });
    if (mttrIdData != null) {
      await mttrPrediction.findByIdAndUpdate(
        mttrIdData.id,
        { mttr: n.mttr },
        { new: true, runValidators: true }
      );
    }
  }
}

/**
 * Mmax recompute logic kept (same math; cleaned)
 */
async function recomputeMmax({
  treeRoot,
  projectId,
  treeDocId,
  saveTree, // async fn to persist tree if needed
}) {
  // collect active leaves with mct
  const leaves = collectLeafNodes(treeRoot, { onlyActive: true }).filter(
    (n) => n.mct
  );

  if (leaves.length === 0) return;

  let mctLogSum = 0;
  for (const l of leaves) mctLogSum += Math.log10(l.mct);

  const mctLogCount = leaves.length;

  // NOTE: original uses Math.pow(mctLogValue, 2) etc.
  const converToPowerValue = Math.pow(mctLogSum, 2);
  const logMctValue1 = converToPowerValue / mctLogCount;

  let logMctValueNew = 0;
  for (const l of leaves) {
    const mctLogValue = Math.log10(l.mct);
    const sq = Math.pow(mctLogValue, 2);
    logMctValueNew += sq - logMctValue1;
  }

  const logMctValue2 = (logMctValueNew / (mctLogCount - 1)) * -1;
  const logMctValue2SqrtValue = Math.sqrt(logMctValue2);

  // project pi value
  const projectPiValue = await project.findOne({ _id: projectId });
  const piValue = projectPiValue?.mMaxValue;

  const parentMttrValue = treeRoot.mttr;
  const parentMttrLogValue = Math.log10(parentMttrValue);
  const finalValue = piValue * logMctValue2SqrtValue;
  const finalMmaxValue = parentMttrLogValue + finalValue;

  const mttrIdData = await mttrPrediction.findOne({
    projectId,
    productId: treeRoot.id,
  });

  if (mttrIdData != null) {
    const finalMmax = finalMmaxValue ? finalMmaxValue : 0;
    await mttrPrediction.findByIdAndUpdate(
      mttrIdData.id,
      { mMax: finalMmax },
      { new: true, runValidators: true }
    );
  }

  // keep tree updated if needed (your original didn’t write mMax to tree, only prediction)
  if (typeof saveTree === "function") await saveTree(treeDocId, treeRoot);
}

/**
 * =========================================================
 * ✅ APIs (optimized structure, same outputs / behavior)
 * =========================================================
 */

export async function createProduct(req, res, next) {
  try {
    const data = req.body;

    const existTreeDocs = await productTreeStructure.find({
      projectId: data.projectId,
      companyId: data.companyId,
    });

    const productIndex = data.indexCount - 1;
    const treeDoc = existTreeDocs[productIndex];
    const treeStructure = treeDoc?.treeStructure;

    // CASE 1: Create as parent product (no parentId)
    if (data.parentId === undefined || data.parentId === null) {
      const productData = data.parentId
        ? {
          projectId: data.projectId,
          companyId: data.companyId,
          parentId: data.parentId,
          productName: data.productName,
        }
        : {
          projectId: data.projectId,
          companyId: data.companyId,
          productName: data.productName,
        };

      const createData = await product.create(productData);

      if (existTreeDocs.length === 0) {
        const createNode = [
          {
            id: createData._id,
            indexCount: "1",
            productName: data.productName,
            category: data.category,
            reference: data.reference,
            partType: data.partType,
            partNumber: data.partNumber,
            quantity: data.quantity,
            environment: data.environment,
            temperature: data.temperature,
            status: ACTIVE_TREE,
            fr: "",
            mttr: "",
            mct: "",
            mlh: "",
            children: [],
          },
        ];

        await productTreeStructure.create({
          projectId: data.projectId,
          companyId: data.companyId,
          productId: createData._id,
          treeStructure: createNode,
        });

        return res.status(201).json({ message: "Sub-Product Created Successfuly" });
      }

      // exists: append at root array level
      const treeIndexCount = await productTreeStructure.find({
        projectId: data.projectId,
      });

      const parentProduct = treeIndexCount.filter(
        (list) => list.treeStructure?.status === "active"
      );
      const treeIndex = parentProduct.length;

      const addNode = [
        ...(treeStructure || []),
        {
          id: createData._id,
          indexCount: `${treeIndex + 1}`,
          productName: data.productName,
          category: data.category,
          reference: data.reference,
          partType: data.partType,
          partNumber: data.partNumber,
          quantity: data.quantity,
          environment: data.environment,
          temperature: data.temperature,
          status: ACTIVE_TREE,
          children: [],
        },
      ];

      await productTreeStructure.findByIdAndUpdate(treeDoc.id, {
        treeStructure: addNode,
      });

      return res.status(201).json({ message: "Sub-Product Created Successfuly" });
    }

    // CASE 2: Create as sub-product under an existing node
    async function insertNodeIntoTree(node, nodeId, treeDocId) {
      if (!node) return false;

      if (toStrId(node.id) === toStrId(nodeId)) {
        // build all active nodes list once (same as your original approach but faster)
        const allNodes = collectNodesDFS(treeStructure, { onlyActive: false });
        const productData = allNodes.find(
          (n) => toStrId(n.id) === toStrId(data.parentId)
        );

        if (
          productData?.category === "Electronic" ||
          productData?.category === "Mechanical"
        ) {
          res.status(400).json({
            message: `Sub-Product Not Allowed In ${productData.category}`,
          });
          return true;
        }

        const productSubData = {
          projectId: data.projectId,
          companyId: data.companyId,
          productId: node.id,
          parentId: data.parentId,
          productName: data.productName,
          category: data.category,
          reference: data.reference,
          partType: data.partType,
          partNumber: data.partNumber,
          quantity: data.quantity,
          environment: data.environment,
          temperature: data.temperature,
          status: ACTIVE_TREE,
        };

        const createData =
          data.category === "Assembly"
            ? await assembly.create(productSubData)
            : data.category === "Electronic"
              ? await electronical.create(productSubData)
              : await mechanical.create(productSubData);

        const childData = ensureChildren(node);
        const activeKids = childData.filter((c) => isActive(c));
        const addNode = {
          id: createData._id,
          productId: node.id,
          productName: data.productName,
          category: data.category,
          parentId: treeStructure?.parentId,
          reference: data.reference,
          partType: data.partType,
          partNumber: data.partNumber,
          quantity: data.quantity,
          environment: data.environment,
          temperature: data.temperature,
          status: ACTIVE_TREE,
          indexCount: `${data.productCount}.${activeKids.length + 1}`,
          children: [],
        };

        node.children.push(addNode);

        await updateTreeDoc(treeDocId, treeStructure);

        res.status(201).json({
          message: "Sub-Product Created Successfuly",
          addNode,
        });
        return true;
      }

      if (Array.isArray(node.children)) {
        for (const c of node.children) {
          const done = await insertNodeIntoTree(c, nodeId, treeDocId);
          if (done) return true;
        }
      }
      return false;
    }

    await insertNodeIntoTree(treeStructure, data.parentId, treeDoc.id);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const data = req.body;

    // ---------- helpers ----------
    const toNum = (v, fallback = 0) => {
      if (v === null || v === undefined) return fallback;
      if (typeof v === "string" && v.trim() === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const calcFrpRateFromPrediction = (frpValue, qty) => {
      if (!frpValue) return 0;

      const quantity = toNum(qty, 1);
      const dutyCycle = toNum(frpValue.dutyCycle, 1);

      let baseRate = 0;
      switch (frpValue.source) {
        case "Field":
          baseRate = toNum(frpValue.field, 0);
          break;
        case "Predicted":
          baseRate = toNum(frpValue.predicted, 0);
          break;
        case "Allocated":
          baseRate = toNum(frpValue.allocated, 0);
          break;
        default:
          baseRate = toNum(frpValue.otherFr, 0);
      }

      const scaled = baseRate * quantity * dutyCycle;

      const offset = toNum(frpValue.failureRateOffset, 0);
      const op = (frpValue.frOffsetOperand || "+").trim();

      if (op === "+") return scaled + offset;
      if (op === "-") return scaled - offset;

      return scaled + offset;
    };

    const calcFrpRateWithoutQuantityFromPrediction = (frpValue) => {
      if (!frpValue) return 0;

      const dutyCycle = toNum(frpValue.dutyCycle, 1);

      let baseRate = 0;
      switch (frpValue.source) {
        case "Field":
          baseRate = toNum(frpValue.field, 0);
          break;
        case "Predicted":
          baseRate = toNum(frpValue.predicted, 0);
          break;
        case "Allocated":
          baseRate = toNum(frpValue.allocated, 0);
          break;
        default:
          baseRate = toNum(frpValue.otherFr, 0);
      }

      const scaled = baseRate * dutyCycle;

      const offset = toNum(frpValue.failureRateOffset, 0);
      const op = (frpValue.frOffsetOperand || "+").trim();

      if (op === "+") return scaled + offset;
      if (op === "-") return scaled - offset;

      return scaled + offset;
    };

    const isActive = (node) => node?.status === "active";

    const ensureChildren = (node) => {
      return Array.isArray(node?.children) ? node.children : [];
    };

    const findNodeById = (node, id) => {
      if (!node) return null;
      if (node.id == id) return node;

      const children = ensureChildren(node);
      for (const child of children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }

      return null;
    };

    const updateTreeDoc = async (treeDocId, treeStructure) => {
      await productTreeStructure.findByIdAndUpdate(
        treeDocId,
        { treeStructure },
        { new: true, runValidators: true }
      );
    };

    const recomputeFrBottomUp = (node) => {
      if (!node) return { fr: 0, frWithoutQuantity: 0 };

      const children = ensureChildren(node);

      if (children.length === 0) {
        return {
          fr: toNum(node.fr, 0),
          frWithoutQuantity: toNum(node.frWithoutQuantity, 0),
        };
      }

      let totalFr = 0;
      let totalFrWithoutQuantity = 0;

      for (const child of children) {
        const childResult = recomputeFrBottomUp(child);

        if (isActive(child)) {
          totalFr += toNum(childResult.fr, 0);
          totalFrWithoutQuantity += toNum(childResult.frWithoutQuantity, 0);
        }
      }

      if (isActive(node)) {
        node.fr = totalFr;
        node.frWithoutQuantity = totalFrWithoutQuantity;
      }

      return {
        fr: toNum(node.fr, 0),
        frWithoutQuantity: toNum(node.frWithoutQuantity, 0),
      };
    };

    const collectLeafNodes = (node, options = {}) => {
      const result = [];
      const onlyActive = options.onlyActive || false;

      const traverse = (current) => {
        if (!current) return;

        const children = ensureChildren(current);
        const activeCheck = onlyActive ? isActive(current) : true;

        if (children.length === 0) {
          if (activeCheck) result.push(current);
          return;
        }

        for (const child of children) {
          traverse(child);
        }
      };

      traverse(node);
      return result;
    };

    // single fetch
    const existTree = await productTreeStructure.findOne({
      _id: data.productTreeStructureId,
    });

    const treeStructureMain = existTree?.treeStructure;

    // update node attributes
    const nodeToUpdate = findNodeById(treeStructureMain, data.productId);
    if (!nodeToUpdate) {
      return res.status(404).json({ message: "Product node not found" });
    }

    nodeToUpdate.productName = data.productName;
    nodeToUpdate.category = data.category;
    nodeToUpdate.reference = data.reference;
    nodeToUpdate.partType = data.partType;
    nodeToUpdate.partNumber = data.partNumber;
    nodeToUpdate.quantity = data.quantity;
    nodeToUpdate.environment = data.environment;
    nodeToUpdate.temperature = data.temperature;

    // persist initial edit
    await updateTreeDoc(data.productTreeStructureId, treeStructureMain);

    /**
     * ============================
     * FR update
     * ============================
     */
    const frpValue = await FailureRatePrediction.findOne({
      productId: data.productId,
    });

    const qty = parseFloat(data.quantity);
    const frpRate = calcFrpRateFromPrediction(frpValue, qty);
    const frpRateWithoutQuantity =
      calcFrpRateWithoutQuantityFromPrediction(frpValue);

    // update prediction row also, if needed
    if (frpValue) {
      await FailureRatePrediction.findByIdAndUpdate(
        frpValue._id,
        {
          quantity: data.quantity,
          frpRate: frpRate,
          frpRateWithoutQuantity: frpRateWithoutQuantity,
        },
        { new: true, runValidators: true }
      );
    }

    // update current node FR values
    const frNode = findNodeById(treeStructureMain, data.productId);
    if (frNode) {
      frNode.fr = frpRate;
      frNode.frWithoutQuantity = frpRateWithoutQuantity;
    }

    // recompute parent fr bottom-up
    recomputeFrBottomUp(treeStructureMain);

    await updateTreeDoc(data.productTreeStructureId, treeStructureMain);

    /**
     * ============================
     * MTTR / MCT / MLH update
     * ============================
     */
    const leafNode = findNodeById(treeStructureMain, data.productId);

    if (leafNode && isActive(leafNode) && ensureChildren(leafNode).length === 0) {
      leafNode.mct = data.mct;
      leafNode.mlh = data.mlh;

      if (leafNode.category === "Assembly") {
        const mctValue = toNum(data.mct, 0);
        const mttrValue = leafNode.fr > 0 ? (leafNode.fr * mctValue) / leafNode.fr : 0;
        if (mttrValue > 0) leafNode.mttr = mttrValue;
      }
    } else if (leafNode && isActive(leafNode)) {
      leafNode.mct = data.mct;
      leafNode.mlh = data.mlh;
    }

    await updateTreeDoc(data.productTreeStructureId, treeStructureMain);

    // recompute parent assembly mttr and update mttrPrediction rows
    await recomputeMttrBottomUpAndPersistPredictions({
      treeRoot: treeStructureMain,
      projectId: data.projectId,
    });

    // recompute root mttr using all active leaves
    const activeLeaves = collectLeafNodes(treeStructureMain, { onlyActive: true });
    let totalFr = 0;
    let totalFrMct = 0;

    for (const l of activeLeaves) {
      if (toNum(l.fr, 0) && toNum(l.mct, 0) && isActive(l)) {
        totalFr += toNum(l.fr, 0);
        totalFrMct += toNum(l.fr, 0) * toNum(l.mct, 0);
      }
    }

    if (treeStructureMain?.id && treeStructureMain.category === "Assembly") {
      const rootMttr = totalFr > 0 ? totalFrMct / totalFr : 0;
      treeStructureMain.mttr = rootMttr;

      await updateTreeDoc(data.productTreeStructureId, treeStructureMain);

      const rootPred = await mttrPrediction.findOne({
        projectId: data.projectId,
        productId: treeStructureMain.id,
      });

      if (rootPred != null) {
        await mttrPrediction.findByIdAndUpdate(
          rootPred.id,
          { mttr: rootMttr },
          { new: true, runValidators: true }
        );
      }
    }

    // recompute mmax
    await recomputeMmax({
      treeRoot: treeStructureMain,
      projectId: data.projectId,
      treeDocId: data.productTreeStructureId,
      saveTree: updateTreeDoc,
    });

    return res.status(201).json({
      message: "Product Updated Successfuly",
      data: { existTree },
    });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const data = req.body;

    // single fetch
    const existMainTree = await productTreeStructure.findOne({
      _id: data.productTreeStructureId,
    });

    const root = existMainTree?.treeStructure;

    function markInactive(node) {
      node.status = "inactive";
      if (Array.isArray(node.children)) {
        for (const c of node.children) markInactive(c);
      }
    }

    function deleteNode(node) {
      if (!node) return false;
      if (toStrId(node.id) === toStrId(data.productId)) {
        markInactive(node);
        return true;
      }
      if (Array.isArray(node.children)) {
        for (const c of node.children) {
          if (deleteNode(c)) return true;
        }
      }
      return false;
    }

    deleteNode(root);

    await updateTreeDoc(data.productTreeStructureId, root);

    /**
     * Update parent index values (same behavior, reduced DB calls)
     */
    const parentData = await productTreeStructure.find({
      companyId: data.companyId,
      projectId: data.projectId,
    });

    const parentProduct = parentData.filter((list) => isActive(list.treeStructure));

    for (let i = 0; i < parentProduct.length; i++) {
      const parentIndexCount = i + 1;
      const t = parentProduct[i].treeStructure;

      if (t) {
        t.indexCount = parentIndexCount;
        await updateTreeDoc(parentProduct[i].id, t);
      }

      const childNode = t?.children;
      if (Array.isArray(childNode)) {
        const childIndexCount = t.indexCount;
        let j = 0;

        async function updateChildProductIndex(node, indexCount) {
          if (!node) return;
          if (isActive(node)) {
            node.indexCount = indexCount;
            await updateTreeDoc(parentProduct[i].id, t);
          }
          const kids = ensureChildren(node);
          if (kids.length > 0) {
            let jj = 0;
            for (const k of kids) {
              if (isActive(k)) {
                jj++;
                await updateChildProductIndex(k, `${node.indexCount}.${jj}`);
              }
            }
          }
        }

        for (const c of childNode) {
          if (isActive(c)) {
            j++;
            await updateChildProductIndex(c, `${childIndexCount}.${j}`);
          }
        }
      }
    }

    /**
     * FR recompute after delete (same end result)
     */
    const treeDocAfter = await productTreeStructure.findOne({
      _id: data.productTreeStructureId,
    });

    recomputeFrBottomUp(treeDocAfter.treeStructure);
    await updateTreeDoc(data.productTreeStructureId, treeDocAfter.treeStructure);

    /**
     * MTTR recompute after delete (same end result)
     */
    const treeDocAfter2 = await productTreeStructure.findOne({
      _id: data.productTreeStructureId,
    });
    const tree2 = treeDocAfter2.treeStructure;

    // root mttr using active nodes with fr & mct (same as your final block)
    let addFr = 0;
    let totalFrMct = 0;
    const activeNodes = collectNodesDFS(tree2, { onlyActive: true });
    for (const n of activeNodes) {
      if (n.fr && n.mct && isActive(n)) {
        addFr += n.fr;
        totalFrMct += n.fr * n.mct;
      }
    }
    const totalMttr = addFr > 0 ? totalFrMct / addFr : 0;
    if (tree2?.id) tree2.mttr = totalMttr;

    await updateTreeDoc(data.productTreeStructureId, tree2);

    /**
     * Delete parent product doc if root is inactive (same)
     */
    const deleteTree = await productTreeStructure.findOne({
      _id: data.productTreeStructureId,
    });

    if (deleteTree?.treeStructure?.status === "inactive") {
      await productTreeStructure.findByIdAndDelete(deleteTree._id);
    }

    return res.status(201).json({
      message: "Product Deleted Successfully",
      data: { existTree: existMainTree },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllProduct(req, res, next) {
  try {
    const getAllProductDetails = await product
      .find()
      .populate("companyId")
      .populate("projectId");

    res.status(201).json({
      message: "Get All Product Details Successfully ",
      data: { getAllProductDetails },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const productId = req.params.id;

    const getProductDetails = await product
      .findOne({ _id: productId })
      .populate("companyId")
      .populate("projectId");

    res.status(201).json({
      message: "Get Product Details Successfully",
      data: { getProductDetails },
    });
  } catch (error) {
    next(error);
  }
}

export async function parentProductCopyPaste(req, res, next) {
  try {
    const data = req.body;

    const existCopyTree = await productTreeStructure.findOne({
      _id: data.copyProductTreeId,
    });
    const existPasteTree = await productTreeStructure.findOne({
      _id: data.pasteProductTreeId,
    });

    const copyTreeStructure = existCopyTree?.treeStructure;
    const pasteTreeStructure = existPasteTree?.treeStructure;

    const copiedNode = findNodeById(copyTreeStructure, data.copyProductId);
    if (!copiedNode) {
      return res.status(404).json({ message: "Copied node not found" });
    }

    const targetNode = findNodeById(pasteTreeStructure, data.pasteProductId);
    if (!targetNode) {
      return res.status(404).json({ message: "Paste target not found" });
    }

    if (targetNode.category !== "Assembly") {
      return res.status(400).json({
        message: `Sub-Product Not Allowed In ${targetNode.category}`,
      });
    }

    const productData = {
      projectId: existPasteTree.projectId,
      companyId: existPasteTree.companyId,
      productName: copiedNode.productName,
      category: copiedNode.category,
      reference: copiedNode.reference,
      partType: copiedNode.partType,
      partNumber: copiedNode.partNumber,
      quantity: copiedNode.quantity,
      environment: copiedNode.environment,
      temperature: copiedNode.temperature,
      status: copiedNode.status,
    };

    const createData = await product.create(productData);

    ensureChildren(targetNode);

    const nextIndex = countActiveChildren(targetNode) + 1;

    const createNode = {
      id: new mongoose.Types.ObjectId(createData._id),
      indexCount: `${targetNode.indexCount}.${nextIndex}`,
      productId: targetNode.id,
      productName: copiedNode.productName,
      category: copiedNode.category,
      reference: copiedNode.reference,
      partType: copiedNode.partType,
      partNumber: copiedNode.partNumber,
      quantity: copiedNode.quantity,
      environment: copiedNode.environment,
      temperature: copiedNode.temperature,
      status: copiedNode.status,
      parentId: existPasteTree._id,
      fr: "",
      mttr: "",
      mct: "",
      mlh: "",
      children: [],
    };

    targetNode.children.push(createNode);

    await updateTreeDoc(existPasteTree._id, pasteTreeStructure);

    return res.status(201).json({
      message: "Product pasted successfully",
      createNode,
    });
  } catch (error) {
    next(error);
  }
}

export async function subProductCopyPaste(req, res, next) {
  try {
    const data = req.body;
    const copyProductId = data.copyProductTreeId;
    const pasteProductTreeId = data.pasteProductTreeId;
    const pasteProductId = data.pasteProductId;

    const getPasteProductData = await productTreeStructure.findOne({
      _id: pasteProductTreeId,
    });
    const getCopyProductData = await productTreeStructure.findOne({
      _id: copyProductId,
    });

    function collectElements(node, result = []) {
      result.push({ ...node, indexCount: `${node.indexCount}` });
      if (node.children && node.children.length > 0) {
        for (const child of node.children) collectElements(child, result);
      }
      return result;
    }

    const pasteProductArr = collectElements(getPasteProductData.treeStructure);
    const foundProductIndex = pasteProductArr.findIndex(
      (pList) => toStrId(pList.id) === toStrId(pasteProductId)
    );
    const targetProduct = pasteProductArr[foundProductIndex];

    function collectCopyElements(node, parentIndex = "") {
      const currentIndex = node.indexCount;
      const newProduct = {
        ...node,
        // Update index
        indexCount: `${parentIndex}.${currentIndex}`,

        // 🔥 Reset required fields
        fr: null,      // instead of 6.602954199999999
        mttr: null,    // instead of 0
        mct: null,       // keep empty string
        mlh: null,
      };
      if (node.children && node.children.length > 0) {
        newProduct.children = node.children.map((child) =>
          collectCopyElements(child, `${parentIndex}.${currentIndex}`)
        );
      }
      return newProduct;
    }

    function generateNewIds(node) {
      node.id = new mongoose.Types.ObjectId();
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) generateNewIds(child);
      }
    }

    const nodeToCopy = findNodeById(getCopyProductData.treeStructure, data.copyProductId);
    if (!nodeToCopy) {
      return res.status(404).json({ message: "Copied node not found" });
    }

    const copiedElements = collectCopyElements(nodeToCopy);
    generateNewIds(copiedElements);

    if (!targetProduct.children) targetProduct.children = [];
    targetProduct.children.push(copiedElements);
    pasteProductArr[foundProductIndex] = targetProduct;

    // Re-index & update productId/parentId in one traversal (same net effect)
    async function reindex(node, baseIndex, parentIdForKids) {
      node.indexCount = baseIndex;
      node.productId = parentIdForKids;
      node.parentId = pasteProductTreeId;

      const kids = ensureChildren(node).filter((c) => isActive(c));
      for (let i = 0; i < kids.length; i++) {
        await reindex(kids[i], `${baseIndex}.${i + 1}`, node.id);
      }
    }

    const root = pasteProductArr[0];
    await reindex(root, root.indexCount, root.id);

    await updateTreeDoc(getPasteProductData._id, getPasteProductData.treeStructure);

    res.status(201).json({
      message: "Copy and Paste Product Successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
}

export async function getSinglePbsTreeProduct(req, res, next) {
  try {
    const data = req.query;
    const getTreeProductData = await productTreeStructure.findOne({
      _id: data.copyProductTreeId,
    });

    const treeData = getTreeProductData.treeStructure;

    const activeNodes = collectNodesDFS(treeData, { onlyActive: true });
    const found = activeNodes.find((n) => toStrId(n.id) === toStrId(data.copyProductId));

    if (!found) {
      return res.status(404).json({ message: "PBS Product not found" });
    }

    return res.status(200).json({
      message: "Get PBS Product Tree Data",
      treeData: found,
    });
  } catch (err) {
    next(err);
  }
}
