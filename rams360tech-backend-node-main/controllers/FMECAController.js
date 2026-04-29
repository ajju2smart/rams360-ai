import FMECA from "../models/FMECAModel.js";
import { deleteOne } from "./baseController.js";
import failureRatePrediction from "../models/failureRatePredictionModel.js";
import Project from "../models/projectModel.js";
import FMECACR from "../models/FMECACRModel.js";


const EPS = 1e-9;

async function recalculateCR(projectId, productId, companyId) {
  const allCmRecords = await FMECA.find({
    projectId,
    productId,
  }).select("cm");

  let totalCr = allCmRecords.reduce((acc, rec) => {
    return acc + (rec.cm != null ? parseFloat(rec.cm) : 0);
  }, 0);

  // 🔥 Precision cleanup
  totalCr = Number(totalCr.toFixed(10));
  if (Math.abs(totalCr) < EPS) totalCr = 0;

  await FMECACR.findOneAndUpdate(
    { projectId, productId },
    {
      projectId,
      companyId,
      productId,
      cr: totalCr,
    },
    { upsert: true, new: true }
  );
}

const sumArray = (arr = []) => {
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    const num = Number(arr[i]);
    if (!isNaN(num)) total += num;
  }

  return total;
};


export async function createFMECA(req, res, next) {
  try {
    const data = req.body;


    const FailureModeRadio = data?.Alldata;

    const FailureModeRadioTrue = data?.Alldata ? true : false;
    if (FailureModeRadioTrue === true) {
      const finalValue = [];
      const finalValueForEndEffectBeta = [];
      finalValue.push(parseFloat(data.failureModeRatioAlpha));
      finalValueForEndEffectBeta.push(parseFloat(data.endEffectRatioBeta));
      FailureModeRadio.map((list) => {
        finalValue.push(parseFloat(list.failureModeRatioAlpha));
        finalValueForEndEffectBeta.push(parseFloat(list.endEffectRatioBeta));
      });
      const sumofFailureModeRadio = finalValue.reduce((accumulator, currentvalue) => accumulator + currentvalue);
      const sumofEndEffectRatioBeta = finalValueForEndEffectBeta.reduce((accumulator, currentvalue) => accumulator + currentvalue);

      const lastValue = Promise.resolve(sumofFailureModeRadio);
      if (sumofFailureModeRadio > 1) {
        res.status(400).json({
          message: "Failure Mode Radio Alpha Must be Equal to One",
        });
      } else if (sumofEndEffectRatioBeta > 1) {
        res.status(400).json({
          message: "End Effect Ratio Beta Must be Equal to One",
        });
      } else if (sumofFailureModeRadio < 1 || sumofFailureModeRadio === 1) {
        const existData = await FMECA.find({
          projectId: data.projectId, productId: data.productId
        });


        const createData = await FMECA.create({
          fmecaId: existData.length + 1,
          projectId: data.projectId,
          companyId: data.companyId,
          productId: data.productId,
          operatingPhase: data.operatingPhase,
          function: data.function,
          failureMode: data.failureMode,
          // searchFM: data.searchFM,
          cause: data.cause,
          failureModeRatioAlpha: data.failureModeRatioAlpha,
          detectableMeansDuringOperation: data.detectableMeansDuringOperation,
          detectableMeansToMaintainer: data.detectableMeansToMaintainer,
          BuiltInTest: data.BuiltInTest,
          subSystemEffect: data.subSystemEffect,
          systemEffect: data.systemEffect,
          endEffect: data.endEffect,
          endEffectRatioBeta: data.endEffectRatioBeta,
          safetyImpact: data.safetyImpact,
          referenceHazardId: data.referenceHazardId,
          realibilityImpact: data.realibilityImpact,
          serviceDisruptionTime: data.serviceDisruptionTime,
          frequency: data.frequency,
          severity: data.severity,
          occurrence: data.occurrence,
          detection: data.detection,
          rpn: data.rpn,
          riskIndex: data.riskIndex,
          designControl: data.designControl,
          maintenanceControl: data.maintenanceControl,
          exportConstraints: data.exportConstraints,
          immediteActionDuringOperationalPhase: data.immediteActionDuringOperationalPhase,
          immediteActionDuringNonOperationalPhase: data.immediteActionDuringNonOperationalPhase,
          userField1: data.userField1,
          userField2: data.userField2,
          userField3: data.userField3,
          userField4: data.userField4,
          userField5: data.userField5,
          userField6: data.userField6,
          userField7: data.userField7,
          userField8: data.userField8,
          userField9: data.userField9,
          userField10: data.userField10,
        });
        res.status(201).json({
          message: "FMECA Created Successfully",
          data: {
            createData,
          },
        });
      }
    }
  } catch (error) {
    next(error);
  }
}



export async function createFMECANew(req, res, next) {
  try {
    const data = req.body;
    const { projectId, productId, companyId } = data;

    const existingRecords = await FMECA.find({
      projectId,
      productId,
    }).select("failureModeRatioAlpha endEffectRatioBeta");

    const sumAlpha =
      existingRecords.reduce(
        (acc, r) => acc + parseFloat(r.failureModeRatioAlpha || 0),
        0
      ) + parseFloat(data.failureModeRatioAlpha || 0);

    const sumBeta =
      existingRecords.reduce(
        (acc, r) => acc + parseFloat(r.endEffectRatioBeta || 0),
        0
      ) + parseFloat(data.endEffectRatioBeta || 0);

    if (sumAlpha > 1 + EPS) {
      return res.status(400).json({
        message: "Failure Mode Ratio Alpha must not exceed 1",
      });
    }

    if (sumBeta > 1 + EPS) {
      return res.status(400).json({
        message: "End Effect Ratio Beta must not exceed 1",
      });
    }

    // ✅ CHANGED HERE
    const frpData = await failureRatePrediction.findOne({
      projectId,
      productId,
    }).select("frpRateWithoutQuantity");

    const frpRate = frpData?.frpRateWithoutQuantity;

    const projectData = await Project.findById(projectId)
      .select("avgAnnualOperationalHrs productLifeYears");

    const t =
      projectData?.avgAnnualOperationalHrs != null &&
      projectData?.productLifeYears != null
        ? projectData.avgAnnualOperationalHrs *
          projectData.productLifeYears
        : null;

    let cm = 0;

    if (
      t != null &&
      data.failureModeRatioAlpha != null &&
      data.endEffectRatioBeta != null &&
      frpRate != null
    ) {
      cm =
        t *
        parseFloat(data.failureModeRatioAlpha) *
        parseFloat(data.endEffectRatioBeta) *
        frpRate;

      cm = Number(cm.toFixed(10));
      if (Math.abs(cm) < EPS) cm = 0;
    }

    const createdRecord = await FMECA.create({
      ...data,
      fmecaId: existingRecords.length + 1,
      cm,
    });

    // Post-write concurrency guard — compensates for race between read and insert
    const allAfterInsert = await FMECA.find({ projectId, productId })
      .select("failureModeRatioAlpha endEffectRatioBeta");
    const actualAlpha = allAfterInsert.reduce(
      (acc, r) => acc + parseFloat(r.failureModeRatioAlpha || 0), 0
    );
    const actualBeta = allAfterInsert.reduce(
      (acc, r) => acc + parseFloat(r.endEffectRatioBeta || 0), 0
    );
    if (actualAlpha > 1 + EPS || actualBeta > 1 + EPS) {
      await FMECA.findByIdAndDelete(createdRecord._id);
      return res.status(409).json({
        message: "Concurrent write conflict detected. Please retry.",
      });
    }

    // Recalc CR after confirmed insert
    await recalculateCR(projectId, productId, companyId);

    res.status(201).json({
      message: "FMECA Created Successfully",
      data: createdRecord,
    });
  } catch (error) {
    next(error);
  }
}


export async function updateFMECA(req, res, next) {
  try {
    const data = req.body;
    const FailureModeRadio = data?.Alldata;
    const FailureModeRadioTrue = data.Alldata ? true : false;
    const currentFailureModeRadioAlphaValue = data.failureModeRatioAlpha;

    if (FailureModeRadioTrue) {
      if (data.failureModeRatioAlpha <= 1) {
        const finalValue = [];
        FailureModeRadio?.map((list) => {
          finalValue.push(parseFloat(list.failureModeRatioAlpha));
        });
        finalValue.push(parseFloat(currentFailureModeRadioAlphaValue));

        const FailureRadioModeAdditionValue = finalValue.reduce(
          (accumulator, currentvalue) => accumulator + currentvalue
        );
        const degrementValue = await FMECA.findOne({ _id: data.fmecaId });
        const totalValue = [];
        totalValue.push(FailureRadioModeAdditionValue);
        totalValue.push(parseFloat(degrementValue.failureModeRatioAlpha));

        const sumofFailureModeRadio = totalValue.reduce((total, value) => total - value);

        if (sumofFailureModeRadio > 1) {
          res.status(400).json({
            message: "Failure Mode Radio Alpha Must be Equal to One",
          });
        } else if (sumofFailureModeRadio < 1 || sumofFailureModeRadio === 1) {
          const editData = {
            projectId: data.projectId,
            companyId: data.companyId,
            productId: data.productId,
            operatingPhase: data.operatingPhase,
            function: data.function,
            failureMode: data.failureMode,
            // searchFM: data.searchFM,
            failureModeRatioAlpha: data.failureModeRatioAlpha,
            cause: data.cause,
            failureModeRatioAlpha: data.failureModeRatioAlpha,
            detectableMeansDuringOperation: data.detectableMeansDuringOperation,
            detectableMeansToMaintainer: data.detectableMeansToMaintainer,
            BuiltInTest: data.BuiltInTest,
            subSystemEffect: data.subSystemEffect,
            systemEffect: data.systemEffect,
            endEffect: data.endEffect,
            endEffectRatioBeta: data.endEffectRatioBeta,
            safetyImpact: data.safetyImpact,
            referenceHazardId: data.referenceHazardId,
            realibilityImpact: data.realibilityImpact,
            serviceDisruptionTime: data.serviceDisruptionTime,
            frequency: data.frequency,
            severity: data.severity,
            occurrence: data.occurrence,
            detection: data.detection,
            rpn: data.rpn,
            riskIndex: data.riskIndex,
            designControl: data.designControl,
            maintenanceControl: data.maintenanceControl,
            exportConstraints: data.exportConstraints,
            immediteActionDuringOperationalPhase: data.immediteActionDuringOperationalPhase,
            immediteActionDuringNonOperationalPhase: data.immediteActionDuringNonOperationalPhase,
            immediteActionDuringOperationalPhase: data.immediteActionDuringOperationalPhase,
            userField1: data.userField1,
            userField2: data.userField2,
            userField3: data.userField3,
            userField4: data.userField4,
            userField5: data.userField5,
            userField6: data.userField6,
            userField7: data.userField7,
            userField8: data.userField8,
            userField9: data.userField9,
            userField10: data.userField10,
          };
          const editDetail = await FMECA.findByIdAndUpdate(data.fmecaId, editData, {
            new: true,
            runValidators: true,
          });
          // console.log("editDetail....", editDetail)
          res.status(200).json({
            message: "FMECA Updated Successfully",
            editDetail,
          });
        }
        // const sumofFailureModeRadio = finalValue.reduce((accumulator, currentvalue) => accumulator + currentvalue);
        // const lastValue = Promise.resolve(sumofFailureModeRadio);
        // if (sumofFailureModeRadio > 1) {

        // } else if (sumofFailureModeRadio < 1 || sumofFailureModeRadio === 1) {
      } else {
        res.status(204).json({
          message: "Failure Mode Radio Alpha Must be Equal to One",
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function updateFMECANewFnl(req, res, next) {
  try {
    const data = req.body;
    const { projectId, productId, fmecaId, companyId } = data;

    if (!fmecaId) {
      return res.status(400).json({ message: "fmecaId is required" });
    }

    const toNum = (v, fallback = 0) => {
      if (v === null || v === undefined) return fallback;
      if (typeof v === "string" && v.trim() === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    // Get current record
    const existingRecord = await FMECA.findById(fmecaId);
    if (!existingRecord) {
      return res.status(404).json({ message: "FMECA record not found" });
    }

    // Get other records (exclude current)
    const otherRecords = await FMECA.find({
      projectId,
      productId,
      _id: { $ne: fmecaId },
    }).select("failureModeRatioAlpha endEffectRatioBeta");

    // Alpha validation
    const sumAlpha =
      otherRecords.reduce(
        (acc, r) => acc + toNum(r.failureModeRatioAlpha, 0),
        0
      ) + toNum(data.failureModeRatioAlpha, 0);

    if (sumAlpha > 1) {
      return res.status(400).json({
        message: "Failure Mode Ratio Alpha must not exceed 1",
      });
    }

    // Beta validation
    const sumBeta =
      otherRecords.reduce(
        (acc, r) => acc + toNum(r.endEffectRatioBeta, 0),
        0
      ) + toNum(data.endEffectRatioBeta, 0);

    if (sumBeta > 1) {
      return res.status(400).json({
        message: "End Effect Ratio Beta must not exceed 1",
      });
    }

    // CM calculation using frpRateWithoutQuantity
    const frpData = await failureRatePrediction.findOne({
      projectId,
      productId,
    }).select("frpRateWithoutQuantity");

    const frpRateWithoutQuantity = toNum(
      frpData?.frpRateWithoutQuantity,
      0
    );

    const projectData = await Project.findById(projectId).select(
      "avgAnnualOperationalHrs productLifeYears"
    );

    const t =
      projectData?.avgAnnualOperationalHrs != null &&
      projectData?.productLifeYears != null
        ? toNum(projectData.avgAnnualOperationalHrs, 0) *
          toNum(projectData.productLifeYears, 0)
        : null;

    let cm = 0;

    if (
      t != null &&
      data.failureModeRatioAlpha != null &&
      data.endEffectRatioBeta != null &&
      frpRateWithoutQuantity != null
    ) {
      cm =
        t *
        toNum(data.failureModeRatioAlpha, 0) *
        toNum(data.endEffectRatioBeta, 0) *
        frpRateWithoutQuantity;
    }

    // Update FMECA
    const updatePayload = {
      ...data,
      fmecaId: existingRecord.fmecaId,
      cm,
    };

    const updatedRecord = await FMECA.findByIdAndUpdate(
      fmecaId,
      updatePayload,
      { new: true, runValidators: true }
    );

    // CR recalculation
    const allCmRecords = await FMECA.find({
      projectId,
      productId,
    }).select("cm");

    const totalCr = allCmRecords.reduce((acc, rec) => {
      return acc + toNum(rec.cm, 0);
    }, 0);

    await FMECACR.findOneAndUpdate(
      { projectId, productId },
      {
        projectId,
        companyId,
        productId,
        cr: totalCr,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "FMECA Updated Successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllFMECA(req, res, next) {
  try {
    const sparePartsData = await FMECA.find()

      .populate("companyId")
      .populate("productId")
      .populate("projectId");

    res.status(201).json({
      message: "Get All FMECA Details Successfully",
      data: sparePartsData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFMECA(req, res, next) {
  try {
    const data = req.query;


    const fmecaData = await FMECA.find({ projectId: data.projectId, productId: data.productId })
      .populate("companyId")
      .populate("productId")
      .populate("projectId");


    res.status(200).json({
      message: "Get FMECA Details Successfully",
      data: fmecaData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFMECACRById(req, res, next) {
  try {
    const data = req.body;
    const fmecaDataCr = await FMECACR.findOne({ projectId: data.projectId, productId: data.productId })


    res.status(200).json({
      message: "Get FMECA Details Successfully",
      data: fmecaDataCr,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBulkUploadData(req, res, next) {
  try {
    const data = req.body;
    const bulkData = Array.isArray(data.postData) ? data.postData : [];

    // ✅ Fix 1: tolerance for floating point sums
    const EPS = 1e-9;

    // 1️⃣ Existing DB sums
    const existingData = await FMECA.find(
      { projectId: data.projectId, productId: data.productId },
      { failureModeRatioAlpha: 1, endEffectRatioBeta: 1 }
    );

    const existingFailureModeSum = existingData.reduce(
      (sum, item) => sum + (Number(item.failureModeRatioAlpha) || 0),
      0
    );

    const existingEndEffectSum = existingData.reduce(
      (sum, item) => sum + (Number(item.endEffectRatioBeta) || 0),
      0
    );

    // 2️⃣ Bulk sums
    const bulkFailureModeSum = bulkData.reduce(
      (sum, item) => sum + (Number(item.failureModeRatioAlpha) || 0),
      0
    );

    const bulkEndEffectSum = bulkData.reduce(
      (sum, item) => sum + (Number(item.endEffectRatioBeta) || 0),
      0
    );

    const alphaTotal = existingFailureModeSum + bulkFailureModeSum;
    const betaTotal = existingEndEffectSum + bulkEndEffectSum;

    // 3️⃣ Validate totals (with EPS)
    if (alphaTotal > 1 + EPS) {
      return res.status(400).json({
        message: "Failure Mode Ratio Alpha sum must not exceed 1",
      });
    }

    if (betaTotal > 1 + EPS) {
      return res.status(400).json({
        message: "End Effect Ratio Beta sum must not exceed 1",
      });
    }

    // 4️⃣ Generate FMECA IDs
    const existingCount = await FMECA.countDocuments({
      projectId: data.projectId,
      productId: data.productId,
    });

    let nextFmecaId = existingCount + 1;

    // 5️⃣ Prepare docs
    const createData = bulkData.map((item) => ({
      fmecaId: nextFmecaId++,
      projectId: data.projectId,
      companyId: data.companyId,
      productId: data.productId,

      operatingPhase: item.operatingPhase,
      function: item.function,
      failureMode: item.failureMode,
      cause: item.cause,

      failureModeRatioAlpha: item.failureModeRatioAlpha,
      detectableMeansDuringOperation: item.detectableMeansDuringOperation,
      detectableMeansToMaintainer: item.detectableMeansToMaintainer,
      BuiltInTest: item.BuiltInTest,
      subSystemEffect: item.subSystemEffect,
      systemEffect: item.systemEffect,
      endEffect: item.endEffect,
      endEffectRatioBeta: item.endEffectRatioBeta,
      safetyImpact: item.safetyImpact,
      referenceHazardId: item.referenceHazardId,
      realibilityImpact: item.realibilityImpact,
      serviceDisruptionTime: item.serviceDisruptionTime,
      frequency: item.frequency,
      severity: item.severity,
      occurrence: item.occurrence,
      detection: item.detection,
      rpn: item.rpn,
      riskIndex: item.riskIndex,
      designControl: item.designControl,
      maintenanceControl: item.maintenanceControl,
      exportConstraints: item.exportConstraints,
      immediteActionDuringOperationalPhase: item.immediteActionDuringOperationalPhase,
      immediteActionDuringNonOperationalPhase: item.immediteActionDuringNonOperationalPhase,
      userField1: item.userField1,
      userField2: item.userField2,
      userField3: item.userField3,
      userField4: item.userField4,
      userField5: item.userField5,
      userField6: item.userField6,
      userField7: item.userField7,
      userField8: item.userField8,
      userField9: item.userField9,
      userField10: item.userField10,
    }));

    // 6️⃣ Insert
    await FMECA.insertMany(createData);

    return res.status(201).json({
      message: "Bulk FMECA uploaded successfully",
      data: { createData },
    });
  } catch (error) {
    next(error);
  }
}

export async function createBulkUploadDataNew(req, res, next) {
  try {
    const data = req.body;
    const bulkData = Array.isArray(data.postData) ? data.postData : [];
    const { projectId, productId, companyId } = data;

    // =========================
    // 🔹 VALIDATION SECTION
    // =========================

    const existingData = await FMECA.find(
      { projectId, productId },
      { failureModeRatioAlpha: 1, endEffectRatioBeta: 1 }
    );

    const existingFailureModeSum = existingData.reduce(
      (sum, item) => sum + (Number(item.failureModeRatioAlpha) || 0),
      0
    );

    const existingEndEffectSum = existingData.reduce(
      (sum, item) => sum + (Number(item.endEffectRatioBeta) || 0),
      0
    );

    const bulkFailureModeSum = bulkData.reduce(
      (sum, item) => sum + (Number(item.failureModeRatioAlpha) || 0),
      0
    );

    const bulkEndEffectSum = bulkData.reduce(
      (sum, item) => sum + (Number(item.endEffectRatioBeta) || 0),
      0
    );

    const alphaTotal = existingFailureModeSum + bulkFailureModeSum;
    const betaTotal = existingEndEffectSum + bulkEndEffectSum;

    if (alphaTotal > 1 + EPS) {
      return res.status(400).json({
        message: "Failure Mode Ratio Alpha sum must not exceed 1",
      });
    }

    if (betaTotal > 1 + EPS) {
      return res.status(400).json({
        message: "End Effect Ratio Beta sum must not exceed 1",
      });
    }

    // =========================
    // 🔹 FETCH CALCULATION DATA
    // =========================

    const frpData = await failureRatePrediction.findOne({
      projectId,
      productId,
    }).select("frpRate");

    const frpRate = frpData?.frpRate;

    const projectData = await Project.findById(projectId)
      .select("avgAnnualOperationalHrs productLifeYears");

    const t =
      projectData?.avgAnnualOperationalHrs != null &&
        projectData?.productLifeYears != null
        ? projectData.avgAnnualOperationalHrs *
        projectData.productLifeYears
        : null;

    // =========================
    // 🔹 PREPARE DOCUMENTS
    // =========================

    const existingCount = await FMECA.countDocuments({
      projectId,
      productId,
    });

    let nextFmecaId = existingCount + 1;

    const createData = bulkData.map((item) => {
      let cm = 0;

      if (
        t != null &&
        item.failureModeRatioAlpha != null &&
        item.endEffectRatioBeta != null &&
        frpRate != null
      ) {
        cm =
          t *
          Number(item.failureModeRatioAlpha) *
          Number(item.endEffectRatioBeta) *
          frpRate;

        cm = Number(cm.toFixed(10));
        if (Math.abs(cm) < EPS) cm = 0;
      }

      return {
        fmecaId: nextFmecaId++,
        projectId,
        companyId,
        productId,

        operatingPhase: item.operatingPhase,
        function: item.function,
        failureMode: item.failureMode,
        cause: item.cause,
        failureModeRatioAlpha: item.failureModeRatioAlpha,
        detectableMeansDuringOperation: item.detectableMeansDuringOperation,
        detectableMeansToMaintainer: item.detectableMeansToMaintainer,
        BuiltInTest: item.BuiltInTest,
        subSystemEffect: item.subSystemEffect,
        systemEffect: item.systemEffect,
        endEffect: item.endEffect,
        endEffectRatioBeta: item.endEffectRatioBeta,
        safetyImpact: item.safetyImpact,
        referenceHazardId: item.referenceHazardId,
        realibilityImpact: item.realibilityImpact,
        serviceDisruptionTime: item.serviceDisruptionTime,
        frequency: item.frequency,
        severity: item.severity,
        occurrence: item.occurrence,
        detection: item.detection,
        rpn: item.rpn,
        riskIndex: item.riskIndex,
        designControl: item.designControl,
        maintenanceControl: item.maintenanceControl,
        exportConstraints: item.exportConstraints,
        immediteActionDuringOperationalPhase:
          item.immediteActionDuringOperationalPhase,
        immediteActionDuringNonOperationalPhase:
          item.immediteActionDuringNonOperationalPhase,
        userField1: item.userField1,
        userField2: item.userField2,
        userField3: item.userField3,
        userField4: item.userField4,
        userField5: item.userField5,
        userField6: item.userField6,
        userField7: item.userField7,
        userField8: item.userField8,
        userField9: item.userField9,
        userField10: item.userField10,

        cm,
      };
    });

    // =========================
    // 🔹 INSERT & RECALCULATE CR
    // =========================

    await FMECA.insertMany(createData);

    // 🔥 Always recompute full CR
    await recalculateCR(projectId, productId, companyId);

    return res.status(201).json({
      message: "Bulk FMECA uploaded successfully",
      data: createData,
    });

  } catch (error) {
    next(error);
  }
}

export const deleteFMECANew = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await FMECA.findById(id);

    if (!record) {
      return next(
        new AppError(404, "fail", "No FMECA document found with that id")
      );
    }

    const { projectId, productId, companyId } = record;

    await FMECA.findByIdAndDelete(id);

    // 🔥 Always recompute CR
    await recalculateCR(projectId, productId, companyId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteFMECA = deleteOne(FMECA);
