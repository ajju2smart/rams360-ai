import FailureRatePrediction from "../models/failureRatePredictionModel.js";
import product from "../models/productModel.js";
import Project from "../models/projectModel.js";
import FMECA from "../models/FMECAModel.js"
import FMECACR from "../models/FMECACRModel.js";
import productTreeStructure from "../models/productTreeStructure.js";
import {
  getAll,
  getOne,
  deleteOne,
  createOne,
  updateOne,
} from "./baseController.js";
import nprdFrpData from "../models/nprdFrp2016Model.js";
import nprdPartDescData from "../models/nprdPartDesc2016Model.js";
import nprdPartTypeData from "../models/nprdPartType2016Model.js";

export async function createFailureRatePrediction(req, res, next) {
  try {
    const data = req.body;
    console.log("data", data);

    // ---------- helpers ----------
    const toNum = (v, fallback = 0) => {
      if (v === null || v === undefined) return fallback;
      if (typeof v === "string" && v.trim() === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const getBaseRate = (data) => {
      switch (data.source) {
        case "Field":
          return toNum(data.field, 0);
        case "Predicted":
          return toNum(data.predicted, 0);
        case "Allocated":
          return toNum(data.allocated, 0);
        default:
          return toNum(data.otherFr, 0);
      }
    };

    const applyOffset = (rate, data) => {
      const offset = toNum(data.failureRateOffset, 0);
      const op = (data.frOffsetOperand || "+").trim();

      switch (op) {
        case "+": return rate + offset;
        case "-": return rate - offset;
        case "*": return rate * offset;
        case "/": return offset !== 0 ? rate / offset : rate;
        default: return rate + offset;
      }
    };

    const computeFrpRateWithoutQuantity = (data) => {
      const dutyCycle = toNum(data.dutyCycle, 1);
      const baseRate = getBaseRate(data);

      // Step 1: apply duty cycle
      const scaled = baseRate * dutyCycle;

      // Step 2: apply offset at per-unit level
      return applyOffset(scaled, data);
    };

    const computeFrpRate = (data) => {
      const qty = toNum(data.quantity, 1);

      // Step 1: get per-unit FR
      const frWithoutQty = computeFrpRateWithoutQuantity(data);

      // Step 2: multiply by quantity
      return frWithoutQty * qty;
    };

    // ---------- compute ----------
    const frpRate = computeFrpRate(data);
    const frpRateWithoutQuantity = computeFrpRateWithoutQuantity(data);

    if (Math.sign(frpRate) === -1 || Math.sign(frpRateWithoutQuantity) === -1) {
      return res.status(201).json({
        message: "FRP Rate Cannot Accept Negative Value",
      });
    }

    // ---------- create / check existing ----------
    const existData = {
      productId: data.productId,
      projectId: data.projectId,
      companyId: data.companyId,
    };

    const exist = await FailureRatePrediction.find(existData);

    if (exist.length === 0) {
      const createData = {
        predicted: data.predicted,
        field: data.field,
        dutyCycle: data.dutyCycle,
        otherFr: data.otherFr,
        mtbfHours: data.mtbfHours,
        frDistribution: data.frDistribution,
        allocated: data.allocated,
        frRemarks: data.frRemarks,
        failureRateOffset: data.failureRateOffset,
        frOffsetOperand: data.frOffsetOperand,
        standard: data.standard,
        frpRate: frpRate,
        frpRateWithoutQuantity: frpRateWithoutQuantity,
        frUnit: data.frUnit,
        source: data.source,
        quantity: data.quantity,
        productId: data.productId,
        projectId: data.projectId,
        companyId: data.companyId,
        treeStructureId: data.treeStructureId,
      };

      const createFailureRatePrediction = await FailureRatePrediction.create(
        createData
      );

      res.status(201).json({
        message: "FRP Created Successfuly",
        data: { createFailureRatePrediction },
      });
    }

    // ---------- update fr rate to tree structure product ----------
    let existTree = await productTreeStructure.findOne({
      _id: data.treeStructureId,
    });

    const treeStructure = existTree?.treeStructure;

    await updateNodeIntoTree(treeStructure, data.productId, existTree?.id);

    async function updateNodeIntoTree(node, productId, id) {
      if (!node) return;

      if (node.id == productId) {
        node.fr = frpRate;
        node.frWithoutQuantity = frpRateWithoutQuantity;
        await productTreeStructure.findByIdAndUpdate(data.treeStructureId, {
          treeStructure: treeStructure,
        });
        return;
      }

      if (node.children != null) {
        for (let i = 0; i < node.children.length; i++) {
          await findNodeFromTree(node.children[i], productId, id);
        }
      }

      async function findNodeFromTree(node, productId, id) {
        if (!node) return;

        if (node.id == productId) {
          node.fr = frpRate;
          node.frWithoutQuantity = frpRateWithoutQuantity;
          await productTreeStructure.findByIdAndUpdate(data.treeStructureId, {
            treeStructure: treeStructure,
          });
          return;
        }

        if (node.children != null) {
          for (let i = 0; i < node.children.length; i++) {
            await findNodeFromTree(node.children[i], productId, id);
          }
        }
      }
    }

    // ---------- find length for update each item after update ----------
    let parentNode = [];
    let existTree1 = await productTreeStructure.findOne({
      _id: data.treeStructureId,
    });

    const treeStructure1 = existTree1?.treeStructure;

    updateFrpNodeIntoTree(treeStructure1);
    function updateFrpNodeIntoTree(node) {
      if (!node) return;

      if (node.status === "active") parentNode.push(node);

      if (node.children != null) {
        for (let i = 0; i < node.children.length; i++) {
          findFrpNodeFromTree(node.children[i]);
        }
      }

      function findFrpNodeFromTree(node) {
        if (!node) return;

        if (node.status === "active") parentNode.push(node);

        if (node.children != null) {
          for (let i = 0; i < node.children.length; i++) {
            findFrpNodeFromTree(node.children[i]);
          }
        }
      }
    }

    // ---------- bottom-up aggregation ----------
    let idx = 0;
    while (idx < parentNode.length) {
      let activeNodes = [];
      let existTreeLoop = await productTreeStructure.findOne({
        _id: data.treeStructureId,
      });

      const loopTree = existTreeLoop?.treeStructure;

      collectActive(loopTree);
      function collectActive(node) {
        if (!node) return;

        if (node.status === "active") activeNodes.push(node);

        if (node.children != null) {
          for (let i = 0; i < node.children.length; i++) {
            collectActive(node.children[i]);
          }
        }
      }

      for (let i = activeNodes.length - 1; i >= 0; i--) {
        await calcFrpNodeFromTree(
          activeNodes[i],
          activeNodes[i].id,
          existTreeLoop.id
        );
      }

      async function calcFrpNodeFromTree(node, parentNodeId, id) {
        if (!node || !node.children) return;

        let childFrpRate = 0;
        let childFrpRateWithoutQuantity = 0;

        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].status === "active") {
            childFrpRate += toNum(node.children[i].fr, 0);
            childFrpRateWithoutQuantity += toNum(
              node.children[i].frWithoutQuantity,
              0
            );
          }
        }

        if (childFrpRate > 0) node.fr = childFrpRate;
        if (childFrpRateWithoutQuantity > 0) {
          node.frWithoutQuantity = childFrpRateWithoutQuantity;
        }

        for (let i = 0; i < activeNodes.length; i++) {
          await updateParentNode(
            activeNodes[i],
            parentNodeId,
            childFrpRate,
            childFrpRateWithoutQuantity,
            id
          );
        }

        async function updateParentNode(
          node,
          parentNodeId,
          childFrpRate,
          childFrpRateWithoutQuantity,
          id
        ) {
          if (!node) return;

          if (
            node.id == parentNodeId &&
            (childFrpRate > 0 || childFrpRateWithoutQuantity > 0)
          ) {
            if (childFrpRate > 0) node.fr = childFrpRate;
            if (childFrpRateWithoutQuantity > 0) {
              node.frWithoutQuantity = childFrpRateWithoutQuantity;
            }

            await productTreeStructure.findByIdAndUpdate(id, {
              treeStructure: loopTree,
            });
          }
        }
      }

      idx++;
    }
  } catch (error) {
    next(error);
  }
}

export async function updateFailureRatePrediction(req, res, next) {
  try {
    const data = req.body;

    // ---------- helpers ----------
    const toNum = (v, fallback = 0) => {
      if (v === null || v === undefined) return fallback;
      if (typeof v === "string" && v.trim() === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const getBaseRate = () => {
      switch (data.source) {
        case "Field":
          return toNum(data.field, 0);
        case "Predicted":
          return toNum(data.predicted, 0);
        case "Allocated":
          return toNum(data.allocated, 0);
        default:
          return toNum(data.otherFr, 0);
      }
    };

    const applyOffset = (rate, data) => {
      const offset = toNum(data.failureRateOffset, 0);
      const op = (data.frOffsetOperand || "+").trim();

      switch (op) {
        case "+": return rate + offset;
        case "-": return rate - offset;
        case "*": return rate * offset;
        case "/": return offset !== 0 ? rate / offset : rate;
        default: return rate + offset;
      }
    };

    // ---------- calculations ----------
    const baseRate = getBaseRate();
    const qty = toNum(data.quantity, 1);
    const dutyCycle = toNum(data.dutyCycle, 1);

    const frpRate = applyOffset(baseRate * qty * dutyCycle);
    const frpRateWithoutQuantity = applyOffset(baseRate * dutyCycle);

    if (Math.sign(frpRate) === -1 || Math.sign(frpRateWithoutQuantity) === -1) {
      return res.status(201).json({
        message: "FRP Rate Cannot Accept Negative Value",
      });
    }

    // ---------- update FRP ----------
    const editData = {
      predicted: data.predicted,
      field: data.field,
      dutyCycle: data.dutyCycle,
      otherFr: data.otherFr,
      frDistribution: data.frDistribution,
      allocated: data.allocated,
      mtbfHours: data.mtbfHours,
      frRemarks: data.frRemarks,
      failureRateOffset: data.failureRateOffset,
      frOffsetOperand: data.frOffsetOperand,
      frUnit: data.frUnit,
      frpRate: frpRate,
      frpRateWithoutQuantity: frpRateWithoutQuantity, // ✅ NEW
      source: data.source,
      standard: data.standard,
      productId: data.productId,
      projectId: data.projectId,
      companyId: data.companyId,
      treeStructureId: data.treeStructureId,
    };

    const updated = await FailureRatePrediction.findByIdAndUpdate(
      data.frpId,
      editData,
      { new: true, runValidators: true }
    );

    // ---------- update tree ----------
    let existTree = await productTreeStructure.findOne({
      _id: data.treeStructureId,
    });

    const treeStructure = existTree?.treeStructure;

    // update node FR
    updateNode(treeStructure);

    function updateNode(node) {
      if (!node) return;

      if (node.id == data.productId) {
        node.fr = frpRate;
        node.frWithoutQuantity = frpRateWithoutQuantity; // ✅ NEW
      }

      if (node.children) {
        for (const child of node.children) {
          updateNode(child);
        }
      }
    }

    // ---------- bottom-up aggregation ----------
    function recomputeFr(node) {
      if (!node) return { fr: 0, frWithoutQuantity: 0 };

      if (!node.children || node.children.length === 0) {
        return {
          fr: toNum(node.fr, 0),
          frWithoutQuantity: toNum(node.frWithoutQuantity, 0),
        };
      }

      let totalFr = 0;
      let totalFrWithoutQty = 0;

      for (const child of node.children) {
        const childRes = recomputeFr(child);

        if (child.status === "active") {
          totalFr += childRes.fr;
          totalFrWithoutQty += childRes.frWithoutQuantity;
        }
      }

      if (node.status === "active") {
        node.fr = totalFr;
        node.frWithoutQuantity = totalFrWithoutQty; // ✅ NEW
      }

      return {
        fr: node.fr,
        frWithoutQuantity: node.frWithoutQuantity,
      };
    }

    recomputeFr(treeStructure);

    await productTreeStructure.findByIdAndUpdate(data.treeStructureId, {
      treeStructure,
    });

    return res.status(201).json({
      message: "FRP Updated Successfuly",
      data: { updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFailureRatePredictionNew(req, res, next) {
  try {
    const data = req.body;

    const toNum = (v, fallback = 0) => {
      if (v === null || v === undefined) return fallback;
      if (typeof v === "string" && v.trim() === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const field = toNum(data.field);
    const predicted = toNum(data.predicted);
    const allocated = toNum(data.allocated);
    const otherFr = toNum(data.otherFr);
    const qty = toNum(data.quantity, 1);
    const dutyCycle = toNum(data.dutyCycle, 1);
    const offset = toNum(data.failureRateOffset, 0);
    const operator = (data.frOffsetOperand || "+").trim();

    // =========================
    // Compute Base Rate
    // =========================
    let baseRate = 0;

    if (data.source === "Field") baseRate = field;
    else if (data.source === "Predicted") baseRate = predicted;
    else if (data.source === "Allocated") baseRate = allocated;
    else baseRate = otherFr;

    // =========================
    // Compute FRP Rate
    // =========================
    let frpRate = baseRate * qty * dutyCycle;
    let frpRateWithoutQuantity = baseRate * dutyCycle;

    if (operator === "+") {
      frpRate += offset;
      frpRateWithoutQuantity += offset;
    } else if (operator === "-") {
      frpRate -= offset;
      frpRateWithoutQuantity -= offset;
    }

    if (frpRate < 0 || frpRateWithoutQuantity < 0) {
      return res.status(400).json({
        message: "FRP Rate Cannot Accept Negative Value",
      });
    }

    // =========================
    // Update FRP
    // =========================
    const updatedFRP = await FailureRatePrediction.findByIdAndUpdate(
      data.frpId,
      {
        ...data,
        frpRate,
        frpRateWithoutQuantity,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFRP) {
      return res.status(404).json({
        message: "FRP Not Found",
      });
    }

    // =========================
    // Recalculate FMECA CM + CR
    // =========================
    const projectData = await Project.findById(data.projectId).select(
      "avgAnnualOperationalHrs productLifeYears"
    );

    const t =
      projectData?.avgAnnualOperationalHrs != null &&
        projectData?.productLifeYears != null
        ? projectData.avgAnnualOperationalHrs *
        projectData.productLifeYears
        : null;

    if (t != null) {
      const fmecaRecords = await FMECA.find({
        projectId: data.projectId,
        productId: data.productId,
      }).select("_id failureModeRatioAlpha endEffectRatioBeta");

      if (fmecaRecords.length > 0) {
        let totalCr = 0;
        const bulkOps = [];

        for (const record of fmecaRecords) {
          let newCm = 0;

          if (
            record.failureModeRatioAlpha != null &&
            record.endEffectRatioBeta != null
          ) {
            newCm =
              t *
              Number(record.failureModeRatioAlpha) *
              Number(record.endEffectRatioBeta) *
              frpRate;
          }

          totalCr += newCm;

          bulkOps.push({
            updateOne: {
              filter: { _id: record._id },
              update: { $set: { cm: newCm } },
            },
          });
        }

        if (bulkOps.length > 0) {
          await FMECA.bulkWrite(bulkOps);
        }

        await FMECACR.findOneAndUpdate(
          {
            projectId: data.projectId,
            productId: data.productId,
          },
          {
            $set: {
              cr: totalCr,
              companyId: data.companyId,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    return res.status(200).json({
      message: "FRP Updated & FMECA CM & CR Recalculated Successfully",
      data: updatedFRP,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFailureRatePrediction(req, res, next) {
  try {
    const id = req.params.id;
    const frpData = await FailureRatePrediction.findOne({ _id: id })
      .populate("productId")
      .populate("projectId")
      .populate("companyId")
      .populate("assemblyId")
      .populate("electronicalId")
      .populate("mechanicalId");

    res.status(200).json({
      status: "success",
      message: "Get Failure Rate Prediction Successfully",
      data: frpData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllFailureRatePrediction(req, res, next) {
  try {
    const frpData = await FailureRatePrediction.find({})
      .populate("productId")
      .populate("projectId")
      .populate("companyId")
      .populate("assemblyId")
      .populate("electronicalId")
      .populate("mechanicalId");

    res.status(200).json({
      status: "success",
      message: "Get All Failure Rate Prediction Successfully",
      data: frpData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductFailureRateData(req, res, next) {
  try {
    const data = req.query;

    const frpData = await FailureRatePrediction.findOne({
      projectId: data.projectId,
      productId: data.productId,
      companyId: data.companyId,
    });
    res.status(200).json({
      frpData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNprd2016Datas(req, res, next) {
  try {
    const getPartTypeData = await nprdPartTypeData.find();

    res.status(200).json({
      message: "Get Nprd Data Successfully",
      data: {
        // getFrpData,
        // getPartDescData,
        getPartTypeData,
      },
    });
  } catch (err) {
    next(err);
  }
}
export async function getNprd2016Description(req, res, next) {
  try {
    // Extract the query parameters from the request
    const { partTypeId } = req.query;

    // Build a dynamic filter object based on the provided parameters
    const filter = {};

    if (partTypeId) {
      filter.PartTypeId = Number(partTypeId);
    }

    // Query the database with the constructed filter
    const filteredData = await nprdPartDescData.find(filter);

    // Send the filtered data back to the frontend
    res.status(200).json({
      message: "Filtered Nprd Data Successfully",
      data: filteredData,
    });
  } catch (err) {
    // Handle any errors that occur
    next(err);
  }
}

export async function getNprd2016Value(req, res, next) {
  try {
    // Extract the query parameters from the request
    const { partType2016Nprd, quality, partDescrId } = req.query;

    // Build a dynamic filter object based on the provided parameters
    const filter = {};

    if (partType2016Nprd) {
      filter.PartTypeId = Number(partType2016Nprd);
    }

    if (quality) {
      filter.Quality = quality;
    }

    if (partDescrId) {
      filter.PartDescrId = Number(partDescrId); // Convert to number
    }

    // Query the database with the constructed filter
    const filteredData = await nprdFrpData.find(filter);

    // Send the filtered data back to the frontend
    res.status(200).json({
      message: "Filtered Nprd Data Successfully",
      data: filteredData,
    });
  } catch (err) {
    // Handle any errors that occur
    next(err);
  }
}

export const deleteFailureRatePrediction = deleteOne(FailureRatePrediction);
