import productTreeStructure from "../models/productTreeStructure.js";
import productBreakdownStructure from "../models/productBreakdownStructureModel.js";
import FailureRatePrediction from "../models/failureRatePredictionModel.js";
import MTTRPrediction from "../models/mttrPredictionModel.js";
import PMMRA from "../models/pmMraModel.js";
import SparePartsAnalysis from "../models/sparePartsAnalysisModel.js";
import FMECA from "../models/FMECAModel.js";
import SAFETY from "../models/safetyModel.js";

// Shared iterative tree collector — replaces all inline getNodeTreeProduct
function collectActiveNodes(children) {
  const stack = Array.isArray(children) ? [...children] : [];
  const result = [];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node?.status === "active") result.push(node);
    if (Array.isArray(node?.children) && node.children.length > 0) {
      stack.push(...node.children);
    }
  }
  return result;
}

export async function getPbsReport(req, res, next) {
  try {
    const data = req.query;
    const reportType = data.reportType;
    if (reportType == 0) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");
      const allProductData = [];
      treeStructure.map((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
        async function getNodeTreeProduct(childNode) {
          if (childNode != null) {
            for (let i = 0; i < childNode.length; i++) {
              if (childNode[i].status == "active") {
                allProductData.push(childNode[i]);
              }
              getNodeTreeProduct(childNode[i].children);
            }
          }
        }
      });

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: allProductData,
      });
    } else if (reportType == 1) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");
      const allProductData = [];
      treeStructure.map((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
        async function getNodeTreeProduct(childNode) {
          if (childNode != null) {
            for (let i = 0; i < childNode.length; i++) {
              if (childNode[i].status == "active") {
                allProductData.push(childNode[i]);
              }
              getNodeTreeProduct(childNode[i].children);
            }
          }
        }
      });
      function filterDataByHierarchyType(allProductData, hierarchyType) {
        return new Promise((resolve, reject) => {
          let filteredData = [];
          try {
            if (hierarchyType == 1) {
              filteredData = allProductData.filter((item) => {
                const indexCountStr = String(item.indexCount);
                return !indexCountStr.includes(".");
              });
            } else if (hierarchyType) {
              filteredData = allProductData.filter((item) => {
                const indexCountStr = String(item.indexCount);
                return indexCountStr.split(".").length == hierarchyType;
              });
            }
            resolve(filteredData);
          } catch (error) {
            reject(error);
          }
        });
      }

      const hierarchyType = parseInt(data.hierarchyType);

      try {
        const filteredData = await filterDataByHierarchyType(
          allProductData,
          hierarchyType
        );

        res.status(201).json({
          message: "Get Product List Tree Structure",
          data: filteredData,
        });
      } catch (error) {
        res.status(500).json({
          message: "Error filtering data",
          error: error.message,
        });
      }
    } else if (reportType == 2) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");
      const allProductData = [];
      treeStructure.map((list) => {
        const addParentProduct = list.treeStructure;
        if (
          addParentProduct.status == "active" &&
          addParentProduct.category == "Assembly"
        ) {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
        async function getNodeTreeProduct(childNode) {
          if (childNode != null) {
            for (let i = 0; i < childNode.length; i++) {
              if (
                childNode[i].status == "active" &&
                childNode[i].category == "Assembly"
              ) {
                allProductData.push(childNode[i]);
              }
              getNodeTreeProduct(childNode[i].children);
            }
          }
        }
      });
      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: allProductData,
      });
    } else if (reportType == 3) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");
      const allProductData = [];
      treeStructure.map((list) => {
        const addParentProduct = list.treeStructure;
        if (
          addParentProduct.status == "active" &&
          addParentProduct.category == "Electronic"
        ) {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
        async function getNodeTreeProduct(childNode) {
          if (childNode != null) {
            for (let i = 0; i < childNode.length; i++) {
              if (
                childNode[i].status == "active" &&
                childNode[i].category == "Electronic"
              ) {
                allProductData.push(childNode[i]);
              }
              getNodeTreeProduct(childNode[i].children);
            }
          }
        }
      });
      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: allProductData,
      });
    } else if (reportType == 4) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");
      const allProductData = [];
      treeStructure.map((list) => {
        const addParentProduct = list.treeStructure;
        if (
          addParentProduct.status == "active" &&
          addParentProduct.category == "Mechanical"
        ) {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
        async function getNodeTreeProduct(childNode) {
          if (childNode != null) {
            for (let i = 0; i < childNode.length; i++) {
              if (
                childNode[i].status == "active" &&
                childNode[i].category == "Mechanical"
              ) {
                allProductData.push(childNode[i]);
              }
              getNodeTreeProduct(childNode[i].children);
            }
          }
        }
      });
      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: allProductData,
      });
    } else if (reportType == 5) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = [];

      treeStructure.map((list) => {
        const addParentProduct = list.treeStructure;
        if (
          (addParentProduct.status == "active" &&
            addParentProduct.category == "Mechanical") ||
          addParentProduct.category == "Electronic"
        ) {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);

        async function getNodeTreeProduct(childNode) {
          if (childNode != null) {
            for (let i = 0; i < childNode.length; i++) {
              if (
                (childNode[i].status == "active" &&
                  childNode[i].category == "Mechanical") ||
                childNode[i].category == "Electronic"
              ) {
                allProductData.push(childNode[i]);
              }
              getNodeTreeProduct(childNode[i].children);
            }
          }
        }
      });

      // Grouping based on partType
      const groupedData = allProductData.reduce((acc, product) => {
        const partType = product.partType || "Undefined"; // Default to 'Undefined' if partType is not specified
        if (!acc[partType]) {
          acc[partType] = [];
        }
        acc[partType].push(product);
        return acc;
      }, {});

      // Converting grouped data to an array of objects
      const groupedArray = Object.keys(groupedData).map((key, index) => ({
        partType: key,
        items: groupedData[key],
      }));
      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: groupedArray,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getReliabilityReport(req, res, next) {
  try {
    const { projectId, reportType, hierarchyType: hType } = req.query;

    const treeStructure = await productTreeStructure
      .find({ projectId })
      .populate("projectId")
      .populate("companyId");

    let allProductData = [];

    treeStructure.forEach((list) => {
      const root = list.treeStructure;
      if (root.status === "active") allProductData.push(root);
      allProductData.push(...collectActiveNodes(root.children));
    });

    if (reportType == 2) {
      allProductData = allProductData.filter((p) => p.category === "Assembly");
    } else if (reportType == 3) {
      allProductData = allProductData.filter((p) => p.category === "Electronic");
    } else if (reportType == 4) {
      allProductData = allProductData.filter((p) => p.category === "Mechanical");
    } else if (reportType == 5) {
      allProductData = allProductData.filter(
        (p) => p.category === "Mechanical" || p.category === "Electronic"
      );
    }

    const productIds = allProductData.map((p) => p.id);
    const sampleData = await FailureRatePrediction.find({
      projectId,
      productId: { $in: productIds },
    }).populate("productId");

    const sampleDataMap = new Map(
      sampleData.map((r) => [r.productId?._id?.toString() ?? r.productId?.toString(), r])
    );

    const flattenedSampleData = allProductData.map((list) => ({
      productId: list,
      failureRatePrediction: sampleDataMap.get(list.id.toString()) || null,
    }));

    if (reportType == 1) {
      const hierarchyType = parseInt(hType);
      const filteredData = flattenedSampleData.filter((item) => {
        const idx = String(item.productId.indexCount);
        return hierarchyType === 1 ? !idx.includes(".") : idx.split(".").length === hierarchyType;
      });

      return res.status(201).json({
        message: "Get Product List Tree Structure",
        data: filteredData,
      });
    }

    if (reportType == 5) {
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined";
        if (!acc[partType]) acc[partType] = [];
        acc[partType].push(product);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedData).map((key) => ({
        partType: key,
        items: groupedData[key],
      }));

      return res.status(201).json({
        message: "Get Product List Tree Structure",
        data: groupedArray,
      });
    }

    res.status(201).json({
      message: "Get Product List Tree Structure",
      data: flattenedSampleData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMaintainabilityReport(req, res, next) {
  try {
    const { projectId, reportType, hierarchyType: hType } = req.query;

    const treeStructure = await productTreeStructure
      .find({ projectId })
      .populate("projectId")
      .populate("companyId");

    let allProductData = [];
    treeStructure.forEach((list) => {
      const root = list.treeStructure;
      if (root.status === "active") allProductData.push(root);
      allProductData.push(...collectActiveNodes(root.children));
    });

    if (reportType == 2) {
      allProductData = allProductData.filter((p) => p.category === "Assembly");
    } else if (reportType == 3) {
      allProductData = allProductData.filter((p) => p.category === "Electronic");
    } else if (reportType == 4) {
      allProductData = allProductData.filter((p) => p.category === "Mechanical");
    } else if (reportType == 5) {
      allProductData = allProductData.filter(
        (p) => p.category === "Mechanical" || p.category === "Electronic"
      );
    }

    const productIds = allProductData.map((p) => p.id);
    const [mttrResults, pmmraResults] = await Promise.all([
      MTTRPrediction.find({ projectId, productId: { $in: productIds } }).populate("productId"),
      PMMRA.find({ projectId, productId: { $in: productIds } }).populate("productId"),
    ]);

    const mttrMap = new Map();
    mttrResults.forEach((r) => {
      const pid = r.productId?._id?.toString() ?? r.productId?.toString();
      if (!mttrMap.has(pid)) mttrMap.set(pid, []);
      mttrMap.get(pid).push(r);
    });

    const pmmraMap = new Map();
    pmmraResults.forEach((r) => {
      const pid = r.productId?._id?.toString() ?? r.productId?.toString();
      if (!pmmraMap.has(pid)) pmmraMap.set(pid, []);
      pmmraMap.get(pid).push(r);
    });

    const flattenedSampleData = allProductData.map((list) => ({
      productId: list,
      mttrData: mttrMap.get(list.id.toString()) || null,
      pmmraData: pmmraMap.get(list.id.toString()) || null,
    }));

    if (reportType == 1) {
      const hierarchyType = parseInt(hType);
      const filteredData = flattenedSampleData.filter((item) => {
        const idx = String(item.productId.indexCount);
        return hierarchyType === 1 ? !idx.includes(".") : idx.split(".").length === hierarchyType;
      });

      return res.status(201).json({ message: "Get Product List Tree Structure", data: filteredData });
    }

    if (reportType == 5) {
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined";
        if (!acc[partType]) acc[partType] = [];
        acc[partType].push(product);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedData).map((key) => ({
        partType: key,
        items: groupedData[key],
      }));

      return res.status(201).json({ message: "Get Product List Tree Structure", data: groupedArray });
    }

    res.status(201).json({ message: "Get Product List Tree Structure", data: flattenedSampleData });
  } catch (error) {
    next(error);
  }
}

export async function getPreventiveReport(req, res, next) {
  try {
    const { projectId, reportType, hierarchyType: hType } = req.query;

    const treeStructure = await productTreeStructure
      .find({ projectId })
      .populate("projectId")
      .populate("companyId");

    let allProductData = [];
    treeStructure.forEach((list) => {
      const root = list.treeStructure;
      if (root.status === "active") allProductData.push(root);
      allProductData.push(...collectActiveNodes(root.children));
    });

    if (reportType == 2) {
      allProductData = allProductData.filter((p) => p.category === "Assembly");
    } else if (reportType == 3) {
      allProductData = allProductData.filter((p) => p.category === "Electronic");
    } else if (reportType == 4) {
      allProductData = allProductData.filter((p) => p.category === "Mechanical");
    } else if (reportType == 5) {
      allProductData = allProductData.filter(
        (p) => p.category === "Mechanical" || p.category === "Electronic"
      );
    }

    const productIds = allProductData.map((p) => p.id);
    const pmmraResults = await PMMRA.find({
      projectId,
      productId: { $in: productIds },
    }).populate("productId");

    const pmmraMap = new Map();
    pmmraResults.forEach((r) => {
      const pid = r.productId?._id?.toString() ?? r.productId?.toString();
      if (!pmmraMap.has(pid)) pmmraMap.set(pid, []);
      pmmraMap.get(pid).push(r);
    });

    const flattenedSampleData = allProductData.map((list) => ({
      productId: list,
      pmmraData: pmmraMap.get(list.id.toString()) || null,
    }));

    if (reportType == 1) {
      const hierarchyType = parseInt(hType);
      const filteredData = flattenedSampleData.filter((item) => {
        const idx = String(item.productId.indexCount);
        return hierarchyType === 1 ? !idx.includes(".") : idx.split(".").length === hierarchyType;
      });

      return res.status(201).json({ message: "Get Product List Tree Structure", data: filteredData });
    }

    if (reportType == 5) {
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined";
        if (!acc[partType]) acc[partType] = [];
        acc[partType].push(product);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedData).map((key) => ({
        partType: key,
        items: groupedData[key],
      }));

      return res.status(201).json({ message: "Get Product List Tree Structure", data: groupedArray });
    }

    res.status(201).json({ message: "Get Product List Tree Structure", data: flattenedSampleData });
  } catch (error) {
    next(error);
  }
}

export async function getSparePartsAnanysisReport(req, res, next) {
  try {
    const { projectId, reportType, hierarchyType: hType } = req.query;

    const treeStructure = await productTreeStructure
      .find({ projectId })
      .populate("projectId")
      .populate("companyId");

    let allProductData = [];
    treeStructure.forEach((list) => {
      const root = list.treeStructure;
      if (root.status === "active") allProductData.push(root);
      allProductData.push(...collectActiveNodes(root.children));
    });

    if (reportType == 2) {
      allProductData = allProductData.filter((p) => p.category === "Assembly");
    } else if (reportType == 3) {
      allProductData = allProductData.filter((p) => p.category === "Electronic");
    } else if (reportType == 4) {
      allProductData = allProductData.filter((p) => p.category === "Mechanical");
    } else if (reportType == 5) {
      allProductData = allProductData.filter(
        (p) => p.category === "Mechanical" || p.category === "Electronic"
      );
    }

    const productIds = allProductData.map((p) => p.id);
    const [mttrResults, spareResults] = await Promise.all([
      MTTRPrediction.find({ projectId, productId: { $in: productIds } }).populate("productId"),
      SparePartsAnalysis.find({ projectId, productId: { $in: productIds } }).populate("productId"),
    ]);

    const mttrMap = new Map(
      mttrResults.map((r) => [r.productId?._id?.toString() ?? r.productId?.toString(), r])
    );
    const spareMap = new Map(
      spareResults.map((r) => [r.productId?._id?.toString() ?? r.productId?.toString(), r])
    );

    const flattenedSampleData = allProductData.map((list) => ({
      productId: list,
      mttrData: mttrMap.get(list.id.toString()) || null,
      sparePartsData: spareMap.get(list.id.toString()) || null,
    }));

    if (reportType == 1) {
      const hierarchyType = parseInt(hType);
      const filteredData = flattenedSampleData.filter((item) => {
        const idx = String(item.productId.indexCount);
        return hierarchyType === 1 ? !idx.includes(".") : idx.split(".").length === hierarchyType;
      });

      return res.status(201).json({ message: "Get Product List Tree Structure", data: filteredData });
    }

    if (reportType == 5) {
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined";
        if (!acc[partType]) acc[partType] = [];
        acc[partType].push(product);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedData).map((key) => ({
        partType: key,
        items: groupedData[key],
      }));

      return res.status(201).json({ message: "Get Product List Tree Structure", data: groupedArray });
    }

    res.status(201).json({ message: "Get Product List Tree Structure", data: flattenedSampleData });
  } catch (error) {
    next(error);
  }
}

export async function getFmecaReport(req, res, next) {
  try {
    const data = req.query;
    const reportType = data.reportType;

    // ─── Shared helper: recursively collect active nodes ───────────────────────
    const collectActiveNodes = (childNode, allProductData, categoryFilter = null) => {
      if (!childNode) return;
      for (let i = 0; i < childNode.length; i++) {
        const node = childNode[i];
        const isActive = node.status === "active";
        const matchesCategory =
          categoryFilter === null ||
          (Array.isArray(categoryFilter)
            ? categoryFilter.includes(node.category)
            : node.category === categoryFilter);

        if (isActive && matchesCategory) {
          allProductData.push(node);
        }
        collectActiveNodes(node.children, allProductData, categoryFilter);
      }
    };

    // ─── Shared helper: fetch FMECA + PMMRA for a list of products ─────────────
    const fetchDataForProducts = async (productList, projectId) => {
      const promises = productList.map(async (product) => {
        console.log("product",product.id);
        
        const fmecaData = await FMECA.find({
          projectId,
          productId: product.id,
        }).populate("productId");

        const pmmraData = await PMMRA.find({
          projectId,
          productId: product.id,
        }).populate("productId");

        return {
          productId: product,
          fmecaData: fmecaData || [],
          pmmraData: pmmraData || [],
        };
      });

      const results = await Promise.all(promises);
      return results.flat();
    };

    // ─── Shared helper: build allProductData from treeStructure ────────────────
    const buildProductList = (treeStructure, categoryFilter = null) => {
      const allProductData = [];

      treeStructure.forEach((list) => {
        const root = list.treeStructure;
        const isActive = root.status === "active";
        const matchesCategory =
          categoryFilter === null ||
          (Array.isArray(categoryFilter)
            ? categoryFilter.includes(root.category)
            : root.category === categoryFilter);

        if (isActive && matchesCategory) {
          allProductData.push(root);
        }
        collectActiveNodes(root.children, allProductData, categoryFilter);
      });

      return allProductData;
    };

    // ───────────────────────────────────────────────────────────────────────────
    // reportType == 0 → All active products
    // ───────────────────────────────────────────────────────────────────────────
    if (reportType == 0) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = buildProductList(treeStructure, null);
      console.log("allProductData count:", allProductData.length);

      const flattenedSampleData = await fetchDataForProducts(
        allProductData,
        data.projectId
      );

      return res.status(200).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // reportType == 1 → Filter by hierarchy level
    // ───────────────────────────────────────────────────────────────────────────
    else if (reportType == 1) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = buildProductList(treeStructure, null);
      const flattenedSampleData = await fetchDataForProducts(
        allProductData,
        data.projectId
      );

      const hierarchyType = parseInt(data.hierarchyType);

      const filteredData = flattenedSampleData.filter((item) => {
        const indexCountStr = String(item.productId.indexCount);
        if (hierarchyType === 1) {
          return !indexCountStr.includes(".");
        }
        return indexCountStr.split(".").length === hierarchyType;
      });

      return res.status(200).json({
        message: "Get Product List Tree Structure",
        data: filteredData,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // reportType == 2 → Assembly only
    // ───────────────────────────────────────────────────────────────────────────
    else if (reportType == 2) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = buildProductList(treeStructure, "Assembly");
      const flattenedSampleData = await fetchDataForProducts(
        allProductData,
        data.projectId
      );

      return res.status(200).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // reportType == 3 → Electronic only
    // ───────────────────────────────────────────────────────────────────────────
    else if (reportType == 3) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = buildProductList(treeStructure, "Electronic");
      const flattenedSampleData = await fetchDataForProducts(
        allProductData,
        data.projectId
      );

      return res.status(200).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // reportType == 4 → Mechanical only
    // ───────────────────────────────────────────────────────────────────────────
    else if (reportType == 4) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = buildProductList(treeStructure, "Mechanical");
      const flattenedSampleData = await fetchDataForProducts(
        allProductData,
        data.projectId
      );

      return res.status(200).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // reportType == 5 → Mechanical + Electronic, grouped by partType
    // ───────────────────────────────────────────────────────────────────────────
    else if (reportType == 5) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = buildProductList(treeStructure, [
        "Mechanical",
        "Electronic",
      ]);

      const flattenedSampleData = await fetchDataForProducts(
        allProductData,
        data.projectId
      );

      // Group by partType — include ALL products (even those with no FMECA data)
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined";
        if (!acc[partType]) {
          acc[partType] = [];
        }
        acc[partType].push(product);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedData).map((key) => ({
        partType: key,
        items: groupedData[key],
      }));

      return res.status(200).json({
        message: "Get Product List Tree Structure",
        data: groupedArray,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Unknown reportType
    // ───────────────────────────────────────────────────────────────────────────
    else {
      return res.status(400).json({ message: "Invalid reportType" });
    }
  } catch (error) {
    next(error);
  }
}

export async function getSafetyReport(req, res, next) {
  try {
    const { projectId, reportType, hierarchyType: hType } = req.query;

    const treeStructure = await productTreeStructure
      .find({ projectId })
      .populate("projectId")
      .populate("companyId");

    let allProductData = [];
    treeStructure.forEach((list) => {
      const root = list.treeStructure;
      if (root.status === "active") allProductData.push(root);
      allProductData.push(...collectActiveNodes(root.children));
    });

    if (reportType == 2) {
      allProductData = allProductData.filter((p) => p.category === "Assembly");
    } else if (reportType == 3) {
      allProductData = allProductData.filter((p) => p.category === "Electronic");
    } else if (reportType == 4) {
      allProductData = allProductData.filter((p) => p.category === "Mechanical");
    } else if (reportType == 5) {
      allProductData = allProductData.filter(
        (p) => p.category === "Mechanical" || p.category === "Electronic"
      );
    }

    const productIds = allProductData.map((p) => p.id);
    const safetyResults = await SAFETY.find({
      projectId,
      productId: { $in: productIds },
    }).populate("productId");

    const safetyMap = new Map();
    safetyResults.forEach((r) => {
      const pid = r.productId?._id?.toString() ?? r.productId?.toString();
      if (!safetyMap.has(pid)) safetyMap.set(pid, []);
      safetyMap.get(pid).push(r);
    });

    const flattenedSampleData = allProductData.map((list) => {
      const results = safetyMap.get(list.id.toString()) || null;
      return {
        productId: list,
        safetyData: reportType == 0 ? results : (results ? results[0] : null),
      };
    });

    if (reportType == 1) {
      const hierarchyType = parseInt(hType);
      const filteredData = flattenedSampleData.filter((item) => {
        const idx = String(item.productId.indexCount);
        return hierarchyType === 1 ? !idx.includes(".") : idx.split(".").length === hierarchyType;
      });

      return res.status(201).json({ message: "Get Product List Tree Structure", data: filteredData });
    }

    if (reportType == 5) {
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined";
        if (!acc[partType]) acc[partType] = [];
        acc[partType].push(product);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedData).map((key) => ({
        partType: key,
        items: groupedData[key],
      }));

      return res.status(201).json({ message: "Get Product List Tree Structure", data: groupedArray });
    }

    res.status(201).json({ message: "Get Product List Tree Structure", data: flattenedSampleData });
  } catch (error) {
    next(error);
  }
}
