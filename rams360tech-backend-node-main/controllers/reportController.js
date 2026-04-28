import productTreeStructure from "../models/productTreeStructure.js";
import productBreakdownStructure from "../models/productBreakdownStructureModel.js";
import FailureRatePrediction from "../models/failureRatePredictionModel.js";
import MTTRPrediction from "../models/mttrPredictionModel.js";
import PMMRA from "../models/pmMraModel.js";
import SparePartsAnalysis from "../models/sparePartsAnalysisModel.js";
import FMECA from "../models/FMECAModel.js";
import SAFETY from "../models/safetyModel.js";

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
    const data = req.query;
    const reportType = data.reportType;

    if (reportType == 0) {
      // Fetch product tree structure
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = [];

      // Recursively get all active products from the tree structure
      const getNodeTreeProduct = (childNode) => {
        if (childNode != null) {
          for (let i = 0; i < childNode.length; i++) {
            if (childNode[i].status == "active") {
              allProductData.push(childNode[i]);
            }
            getNodeTreeProduct(childNode[i].children);
          }
        }
      };

      treeStructure.forEach((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
      });

      const sampleDataPromises = allProductData.map(async (list) => {
        const result = await FailureRatePrediction.findOne({
          projectId: data.projectId,
          productId: list.id, // Add productId filter
        }).populate("productId");

        if (!result) {
          return {
            productId: list,
            failureRatePrediction: null,
          };
        }

        return {
          productId: list,
          failureRatePrediction: result,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const result = await FailureRatePrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        if (!result) {
          return {
            productId: list,
            failureRatePrediction: null,
          };
        }

        // If results found, return them
        return {
          productId: list,
          failureRatePrediction: result,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      function filterDataByHierarchyType(flattenedSampleData, hierarchyType) {
        return new Promise((resolve, reject) => {
          let filteredData = [];
          try {
            if (hierarchyType == 1) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
                return !indexCountStr.includes(".");
              });
            } else if (hierarchyType) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
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
          flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const result = await FailureRatePrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        if (!result) {
          return {
            productId: list,
            failureRatePrediction: null,
          };
        }

        // If results found, return them
        return {
          productId: list,
          failureRatePrediction: result,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const result = await FailureRatePrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        if (!result) {
          return {
            productId: list,
            failureRatePrediction: null,
          };
        }

        // If results found, return them
        return {
          productId: list,
          failureRatePrediction: result,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const result = await FailureRatePrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        if (!result) {
          return {
            productId: list,
            failureRatePrediction: null,
          };
        }

        // If results found, return them
        return {
          productId: list,
          failureRatePrediction: result,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const result = await FailureRatePrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");
        // If no results found, return an object with productId and null values
        if (!result) {
          return {
            productId: list,
            failureRatePrediction: null,
          };
        }

        // If results found, return them
        return {
          productId: list,
          failureRatePrediction: result,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      // Grouping based on partType
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined"; // Default to 'Undefined' if partType is not specified
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

export async function getMaintainabilityReport(req, res, next) {
  try {
    const data = req.query;
    const reportType = data.reportType;

    if (reportType == 0) {
      // Fetch product tree structure
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = [];

      // Recursively get all active products from the tree structure
      const getNodeTreeProduct = (childNode) => {
        if (childNode != null) {
          for (let i = 0; i < childNode.length; i++) {
            if (childNode[i].status == "active") {
              allProductData.push(childNode[i]);
            }
            getNodeTreeProduct(childNode[i].children);
          }
        }
      };

      treeStructure.forEach((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
      });
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      function filterDataByHierarchyType(flattenedSampleData, hierarchyType) {
        return new Promise((resolve, reject) => {
          let filteredData = [];
          try {
            if (hierarchyType == 1) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
                return !indexCountStr.includes(".");
              });
            } else if (hierarchyType) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
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
          flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      // Grouping based on partType
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined"; // Default to 'Undefined' if partType is not specified
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

export async function getPreventiveReport(req, res, next) {
  try {
    const data = req.query;

    const reportType = data.reportType;

    if (reportType == 0) {
      // Fetch product tree structure
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = [];

      // Recursively get all active products from the tree structure
      const getNodeTreeProduct = (childNode) => {
        if (childNode != null) {
          for (let i = 0; i < childNode.length; i++) {
            if (childNode[i].status == "active") {
              allProductData.push(childNode[i]);
            }
            getNodeTreeProduct(childNode[i].children);
          }
        }
      };

      treeStructure.forEach((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
      });
      const sampleDataPromises = allProductData.map(async (list) => {
        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values

        console.log(pmmraResult, "pmmra list")
        console.log(list, "product list")

        return {
          productId: list,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      function filterDataByHierarchyType(flattenedSampleData, hierarchyType) {
        return new Promise((resolve, reject) => {
          let filteredData = [];
          try {
            if (hierarchyType == 1) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
                return !indexCountStr.includes(".");
              });
            } else if (hierarchyType) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
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
          flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const pmmraResult = await PMMRA.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          pmmraData: pmmraResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      // Grouping based on partType
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined"; // Default to 'Undefined' if partType is not specified
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

export async function getSparePartsAnanysisReport(req, res, next) {
  try {
    const data = req.query;
    const reportType = data.reportType;
    if (reportType == 0) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = [];

      // Recursively get all active products from the tree structure
      const getNodeTreeProduct = (childNode) => {
        if (childNode != null) {
          for (let i = 0; i < childNode.length; i++) {
            if (childNode[i].status == "active") {
              allProductData.push(childNode[i]);
            }
            getNodeTreeProduct(childNode[i].children);
          }
        }
      };



      treeStructure.forEach((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
      });



      console.log(allProductData, 'allProductData .... ')



      const sampleDataPromises = allProductData.map(async (list) => {

        console.log(list, "list value...")

        const mttrResult = await MTTRPrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const sparePartsResult = await SparePartsAnalysis.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        console.log(sparePartsResult, "sparePartsResult")

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          sparePartsData: sparePartsResult || null,
        };
      });



      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure sss",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const sparePartsResult = await SparePartsAnalysis.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          sparePartsData: sparePartsResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      function filterDataByHierarchyType(flattenedSampleData, hierarchyType) {
        return new Promise((resolve, reject) => {
          let filteredData = [];
          try {
            if (hierarchyType == 1) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
                return !indexCountStr.includes(".");
              });
            } else if (hierarchyType) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
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
          flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const sparePartsResult = await SparePartsAnalysis.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          sparePartsData: sparePartsResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const sparePartsResult = await SparePartsAnalysis.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          sparePartsData: sparePartsResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const sparePartsResult = await SparePartsAnalysis.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          sparePartsData: sparePartsResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const mttrResult = await MTTRPrediction.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        const sparePartsResult = await SparePartsAnalysis.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          mttrData: mttrResult || null,
          sparePartsData: sparePartsResult || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      // Grouping based on partType
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined"; // Default to 'Undefined' if partType is not specified
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
    const data = req.query;

    const reportType = data.reportType;
    if (reportType == 0) {
      const treeStructure = await productTreeStructure
        .find({ projectId: data.projectId })
        .populate("projectId")
        .populate("companyId");

      const allProductData = [];

      // Recursively get all active products from the tree structure
      const getNodeTreeProduct = (childNode) => {
        if (childNode != null) {
          for (let i = 0; i < childNode.length; i++) {
            if (childNode[i].status == "active") {
              allProductData.push(childNode[i]);
            }
            getNodeTreeProduct(childNode[i].children);
          }
        }
      };

      treeStructure.forEach((list) => {
        const addParentProduct = list.treeStructure;
        if (addParentProduct.status == "active") {
          allProductData.push(addParentProduct);
        }
        const childNode = addParentProduct.children;
        getNodeTreeProduct(childNode);
      });

      const sampleDataPromises = allProductData.map(async (list) => {
        const safetyDatas = await SAFETY.find({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          safetyData: safetyDatas || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const safetyDatas = await SAFETY.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          safetyData: safetyDatas || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);
      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      function filterDataByHierarchyType(flattenedSampleData, hierarchyType) {
        return new Promise((resolve, reject) => {
          let filteredData = [];
          try {
            if (hierarchyType == 1) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
                return !indexCountStr.includes(".");
              });
            } else if (hierarchyType) {
              filteredData = flattenedSampleData.filter((item) => {
                const indexCountStr = String(item.productId.indexCount);
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
          flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const safetyDatas = await SAFETY.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          safetyData: safetyDatas || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const safetyDatas = await SAFETY.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          safetyData: safetyDatas || null,
        };
      });

      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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
      const sampleDataPromises = allProductData.map(async (list) => {
        const safetyDatas = await SAFETY.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          safetyData: safetyDatas || null,
        };
      });
      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays
      const flattenedSampleData = sampleData.flat();

      res.status(201).json({
        message: "Get Product List Tree Structure",
        data: flattenedSampleData,
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

      const sampleDataPromises = allProductData.map(async (list) => {
        const safetyDatas = await SAFETY.findOne({
          projectId: data.projectId,
          productId: list.id,
        }).populate("productId");

        // If no results found, return an object with productId and null values
        return {
          productId: list,
          safetyData: safetyDatas || null,
        };
      });
      const sampleData = await Promise.all(sampleDataPromises);

      // Flatten the sampleData array if it contains nested arrays

      const flattenedSampleData = sampleData.flat();

      // Grouping based on partType
      const groupedData = flattenedSampleData.reduce((acc, product) => {
        const partType = product.productId.partType || "Undefined"; // Default to 'Undefined' if partType is not specified
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
