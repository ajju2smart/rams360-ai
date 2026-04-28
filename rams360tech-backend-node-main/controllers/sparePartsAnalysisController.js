import productTreeStructure from "../models/productTreeStructure.js";
import sparePartsAnalysisList from "../models/sparePartsAnalysisModel.js";
import { deleteOne } from "./baseController.js";
import Project from "../models/projectModel.js";

export async function createSparePartsAnalysis(req, res, next) {
  try {
    const data = req.body;

    const exist = await sparePartsAnalysisList.find({
      productId: data.productId,
      projectId: data.projectId,
      companyId: data.companyId,
    });

    const createData = await sparePartsAnalysisList.create({
      spare: data.spare,
      recommendedSpare: data.recommendedSpare,
      warrantySpare: data.warrantySpare,
      deliveryTimeDays: data.deliveryTimeDays,
      afterSerialProductionPrice1: data.afterSerialProductionPrice1,
      price1MOQ: data.price1MOQ,
      afterSerialProductionPrice2: data.afterSerialProductionPrice2,
      price2MOQ: data.price2MOQ,
      afterSerialProductionPrice3: data.afterSerialProductionPrice3,
      price3MOQ: data.price3MOQ,
      annualPriceEscalationPercentage: data.annualPriceEscalationPercentage,
      lccPriceValidity: data.lccPriceValidity,
      calculatedSpareQuantity: data.calculatedSpareQuantity,
      recommendedSpareQuantity: data.recommendedSpareQuantity,
      projectId: data.projectId,
      companyId: data.companyId,
      productId: data.productId,
    });
    res.status(201).json({
      message: "Spare Parts Analysis Created Successfully",
      data: {
        createData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSparePartsAnalysis(req, res, next) {
  try {
    const data = req.body;

    const editData = {
      spare: data.spare,
      recommendedSpare: data.recommendedSpare,
      warrantySpare: data.warrantySpare,
      deliveryTimeDays: data.deliveryTimeDays,
      afterSerialProductionPrice1: data.afterSerialProductionPrice1,
      price1MOQ: data.price1MOQ,
      afterSerialProductionPrice2: data.afterSerialProductionPrice2,
      price2MOQ: data.price2MOQ,
      afterSerialProductionPrice3: data.afterSerialProductionPrice3,
      price3MOQ: data.price3MOQ,
      annualPriceEscalationPercentage: data.annualPriceEscalationPercentage,
      lccPriceValidity: data.lccPriceValidity,
      calculatedSpareQuantity: data.calculatedSpareQuantity,
      recommendedSpareQuantity: data.recommendedSpareQuantity,
      projectId: data.projectId,
      companyId: data.companyId,
      productId: data.productId,
    };

    console.log(editData, "editData")

    const editDetail = await sparePartsAnalysisList.findByIdAndUpdate(
      data.spareId,
      editData,
      {
        new: true,
        runValidators: true,
      }
    );

    // console.log(editDetail,"editDetail")

    res.status(201).json({
      message: "Spare Parts Analysis Updated Successfully",
      editDetail,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllSparePartsAnalysis(req, res, next) {
  try {
    const data = req.query;

    const toNum = (v, fallback = 0) => {
      if (v === null || v === undefined) return fallback;
      if (typeof v === "string" && v.trim() === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const sparePartsData = await sparePartsAnalysisList
      .findOne({
        projectId: data.projectId,
        productId: data.productId,
        companyId: data.companyId,
      })
      .populate("projectId")
      .populate("companyId")
      .populate("productId");

    const productTS = await productTreeStructure.findOne({
      _id: data.treeStructureId,
    });

    const spareTreeStructure = productTS?.treeStructure;

    let productFrpWithoutQuantity = 0;

    const findProductNode = (node) => {
      if (!node) return null;

      if (node.id == data.productId && node.status === "active") {
        return node;
      }

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const found = findProductNode(child);
          if (found) return found;
        }
      }

      return null;
    };

    const productNode = findProductNode(spareTreeStructure);

    if (productNode) {
      productFrpWithoutQuantity = toNum(
        productNode.frWithoutQuantity,
        0
      );
    }

    const projectDetails = await Project.findById(data.projectId);

    const productTreeStructureFRvalue = productFrpWithoutQuantity / 1e6;

    const missionTime = toNum(sparePartsData?.deliveryTimeDays, 0);
    const nonShortProbability = toNum(projectDetails?.nonShortProbability, 0);

    const lambdaValue = productTreeStructureFRvalue * missionTime;
    const expValue = Math.exp(-lambdaValue);

    let calculatedSpareQuantity = 0;
    let cumulativeProbability = 0;

    const factorial = (n) => {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    };

    for (let i = 0; i <= 50; i++) {
      const poissonTerm =
        expValue * (Math.pow(lambdaValue, i) / factorial(i));

      cumulativeProbability += poissonTerm;

      console.log("poissonTerm",poissonTerm);
      console.log("cumulativeProbability",cumulativeProbability);
      console.log("nonShortProbability",nonShortProbability);

      if (cumulativeProbability >= nonShortProbability) {
        calculatedSpareQuantity = i;
        break;
      }
    }

    if (sparePartsData?._id) {
      await sparePartsAnalysisList.findByIdAndUpdate(
        sparePartsData._id,
        {
          calculatedSpareQuantity: calculatedSpareQuantity.toString(),
        },
        { new: true }
      );
    }

    return res.status(201).json({
      message: "Get All Spare Parts Analysis Details",
      data: sparePartsData,
      CalculatedSpareQuantity: calculatedSpareQuantity,
    });
  } catch (error) {
    console.error("Error in getAllSparePartsAnalysis:", error);
    next(error);
  }
}

export async function getSparePartsAnalysis(req, res, next) {
  try {
    const id = req.params.id;

    const sparePartsData = await sparePartsAnalysisList
      .findOne({ _id: id })
      .populate("projectId")
      .populate("companyId")
      .populate("productId");


    console.log(sparePartsData, "....sparePartsData.....")

    res.status(200).json({
      message: "Gel Spare Parts Analysis Details",
      data: sparePartsData,
    });
  } catch (error) {
    next(error);
  }
}

export const deleteSparePartsAnalysis = deleteOne(sparePartsAnalysisList);
