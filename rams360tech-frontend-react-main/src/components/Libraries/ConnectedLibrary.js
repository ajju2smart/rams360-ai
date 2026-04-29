import React, { useEffect, useRef } from "react";
import {
  Col,
  Form,
  Row,
  Container,
  Button,
  Modal,
  Card,
} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import Label from "../LabelComponent";
import { useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../PBS/TableIcons";
import { Formik, ErrorMessage, Field } from "formik";
import { customStyles } from "../core/select";
import * as Yup from "yup";
import Api from "../../Api";
// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Loader from "../core/Loader";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

// Static initial values — never depends on runtime state so Formik never reinitializes unexpectedly
const EMPTY_INITIAL_VALUES = {
  Module: "",
  destinationModule: "",
  Field: "",
  Value: "",
  FieldValueAndValue: { field: "", value: "" },
  end: [],
  valueEnd: [],
  FieldValueAndValueEnd: { field: "", value: "" },
};

function ConnectedLibrary(props) {
  const { user } = useAuth();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const [isUpdating, setIsUpdating] = useState(false);
  const userId = user?._id;
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [destinationModuleData, setDestinationModuleData] = useState([]);
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  const [selectModule, setSelectModule] = useState("");
  const [selectDestinationModule, setSelectDestinationModule] = useState("");
  const [moduleFieldValue, setModuleFieldValue] = useState("");
  const [connectData, setConnectData] = useState([]);
  const [sourceId, setSourceId] = useState();
  const [destinationId, setDestinationId] = useState();
  const [editRowData, setEditRowData] = useState(null);
  const [moduleData, setModuleData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [separateData, setSeparateData] = useState([]);
  // FIX: Use a Map keyed by field-name instead of an array.
  // This means updating options for field "X" never touches field "Y",
  // eliminating the re-render that wiped typed values in other inputs.
  const [separateDestinationData, setSeparateDestinationData] = useState(new Map());

  // Ref to Formik's setFieldValue so we can call it from outside the render function
  const formikRef = useRef(null);

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const namesToFilter = [
    "Evident1",
    "Items",
    "condition",
    "failure",
    "redesign",
    "acceptable",
    "lubrication",
    "task",
    "combination",
    "rcmNotes",
  ];

  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: { authorizedPersonnel: userId, projectId: projectId },
    })
      .then((res) => setWritePermission(res?.data?.data?.modules))
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  const getModuleFieldDetails = (value, isDestination = false) => {
    const companyId = user?.companyId;
    Api.post("api/v1/library", {
      moduleName: value,
      projectId: projectId,
      companyId: companyId,
    }).then((response) => {
      const data = response?.data?.libraryData;
      if (isDestination) {
        setDestinationModuleData(data?.moduleData);
      } else {
        setModuleData(data?.moduleData);
      }
    });
  };

const hasWritePermission = () => {
  if (role === "admin") return true;
  if (isOwner || createdBy === userId) return true;

  const module = writePermission?.find(m => m.name === "Connected Library"); // change module name if needed

  return module?.write === true;
};

  const columns = [
    { title: "S.No", render: (rowData) => `${rowData?.tableData?.id + 1}` },
    { title: "Module", field: "libraryId.moduleName" },
    {
      title: "Source",
      render: (rowData) => (
        <div>
          <strong>Name:</strong> {rowData.sourceName}
          <br />
          <strong>Value:</strong> {rowData.sourceValue}
        </div>
      ),
    },
    {
      title: "Destination Module",
      render: (rowData) => <div>{rowData.destinationModuleName}</div>,
    },
    {
      title: "Destination",
      render: (rowData) => (
        <div>
          {rowData.destinationData.map((destination, index) => (
            <div key={index}>
              <strong>{destination.destinationName}: </strong>
              {destination.destinationValue}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const validateSameSourceDestination = (values) => {
    const errors = {};

    if (values.Field && values.end && values.end.length > 0) {
      const sourceFieldName = values.Field.value;
      const hasSameField = values.end.some(
        (dest) => dest.value === sourceFieldName
      );
      if (hasSameField) {
        toast.error("Source field cannot be selected as destination field");
        errors.end = "Source field cannot be selected as destination field";
      }
    }

    if (values.end && values.end.length > 0) {
      const valueEndErrors = [];
      let hasEmptyValue = false;
      let hasDuplicateDestination = false;
      const ratioFields = ["endEffectRatioBeta", "failureModeRatioAlpha"];

      values.end.forEach((selectedOption, index) => {
        const destinationField = selectedOption.value;
        const destinationValue = values.valueEnd[index];

        if (!destinationValue || destinationValue.trim() === "") {
          valueEndErrors[index] = "Value is required";
          hasEmptyValue = true;
        } else {
          valueEndErrors[index] = "";
          const numericValue = parseFloat(destinationValue);

          if (ratioFields.includes(selectedOption.value)) {
            if (numericValue >= 1) {
              errors.valueEnd = errors.valueEnd || [];
              errors.valueEnd[index] = " Destination value must be less than 1";
            }
          } else {
            if (numericValue < 1) {
              errors.valueEnd = errors.valueEnd || [];
              errors.valueEnd[index] =
                " Destination value must be less than or equal to 1";
            }
          }

          const existingDestination = connectData.find((connection) =>
            connection.destinationData.some(
              (dest) =>
                dest.destinationName === destinationField &&
                dest.destinationValue === destinationValue &&
                (!editRowData || connection.sourceId !== editRowData.sourceId)
            )
          );

          if (existingDestination) {
            valueEndErrors[index] = `Destination value "${destinationValue}" already exists for ${selectedOption.label}`;
            hasDuplicateDestination = true;
          }
        }
      });

      if (hasEmptyValue) {
        errors.valueEnd = valueEndErrors;
        toast.error("Please fill all destination values");
      }
      if (hasDuplicateDestination) {
        errors.valueEnd = valueEndErrors;
        toast.error("Some destination values already exist");
      }
    }

    if (values.Module && values.Field && values.FieldValueAndValue.value) {
      const sourceModule = values.Module.value;
      const sourceField = values.Field.value;
      const sourceValue = values.FieldValueAndValue.value;

      const existingConnection = connectData.find(
        (connection) =>
          connection.libraryId?.moduleName === sourceModule &&
          connection.sourceName === sourceField &&
          connection.sourceValue === sourceValue &&
          (!editRowData || connection.sourceId !== editRowData.sourceId)
      );

      if (existingConnection) {
        toast.error(
          `Source value "${sourceValue}" already exists for ${sourceField} in ${sourceModule}`
        );
        errors.FieldValueAndValue = {
          value: `This source value already exists for ${sourceField}`,
        };
      }
    }

    return errors;
  };

  const validation = Yup.object().shape({
    Module: Yup.object().required("Module is required"),
    destinationModule: Yup.object().required("Destination Module is required"),
    Field: Yup.object().required("Field is required"),
    FieldValueAndValue: Yup.object().shape({
      value: Yup.string().required("Source value is required"),
    }),
    end: Yup.array()
      .min(1, "Select at least one destination")
      .required("Field is required"),
    valueEnd: Yup.array()
      .of(Yup.string().required("Destination value is required"))
      .min(1, "At least one value is required"),
  });

  const createConnectLibrary = (values) => {
    setIsLoading(true);
    const comId = user?.companyId;
    Api.post("api/v1/library/create/connect/value", {
      moduleName: values.Module.value,
      destinationModuleName: values.destinationModule.value,
      projectId: projectId,
      companyId: comId,
      sourceId: sourceId,
      sourceName: values.Field.value,
      sourceValue: values.FieldValueAndValue.value,
      destinationData: values,
    })
      .then((res) => {
        setIsLoading(false);
        if (res.status === 201) toast.success(res.data.message);
        else if (res.status === 208) toast.error(res.data.message);
        getAllConnect();
      })
      .catch((error) => {
        if (error?.response?.status === 400) {
          toast.error(error?.response?.data?.message);
          setIsLoading(false);
          getAllConnect();
        }
      });
  };

  const updateConnectLibrary = async (values, { resetForm }) => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const comId = user?.companyId;
      await Api.put("api/v1/library/update/connect/value", {
        moduleName: values.Module.value,
        projectId: projectId,
        companyId: comId,
        sourceId: sourceId,
        sourceName: values.Field.label,
        sourceValue: values.FieldValueAndValue.value,
        destinationData: values,
        destinationModuleName: values.destinationModule.value,
      });
      toast.success("Updated successfully!");
      resetForm(EMPTY_INITIAL_VALUES);
      resetFormFields();
      getAllConnect();
      setIsUpdating(false);
    } catch (error) {
      setIsUpdating(false);
      toast.error(
        error?.response?.data?.message || "Update failed. Please try again."
      );
    }
  };

  const resetFormFields = () => {
    setEditRowData(null);
    setSelectModule("");
    setSelectDestinationModule("");
    setModuleData([]);
    setModuleFieldValue("");
    setSeparateData([]);
    setSeparateDestinationData(new Map());
    setSourceId(null);
    setDestinationId(null);
    setDestinationModuleData([]);
  };

  const deleteConnectLibarary = (values) => {
    setIsLoading(true);
    Api.delete("api/v1/library/delete/connect/value", {
      params: { projectId: projectId, sourceId: values.sourceId },
    })
      .then(() => {
        setIsLoading(false);
        toast.error(`Deleted Successfully`);
        getAllConnect();
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Failed to delete connection. Please try again.");
        console.error("Delete error:", error);
      });
  };

  const getAllConnect = (values) => {
    Api.get("api/v1/library/get/all/connect/library/value", {
      params: { projectId: projectId, moduleName: values ? values : "" },
    }).then((res) => {
      setIsLoading(false);
      setConnectData(res.data.getData);
    });
  };

  // FIX: When editRowData changes, populate form fields directly via setFieldValue
  // instead of relying on enableReinitialize (which caused mid-edit resets).
  useEffect(() => {
    if (editRowData && formikRef.current) {
      const { setFieldValue } = formikRef.current;

      // Populate source module
      setFieldValue("Module", {
        label: editRowData.libraryId.moduleName,
        value: editRowData.libraryId.moduleName,
      });
      setSelectModule(editRowData.libraryId.moduleName);
      getModuleFieldDetails(editRowData.libraryId.moduleName, false);

      // Populate destination module
      setFieldValue("destinationModule", {
        label: editRowData.destinationModuleName,
        value: editRowData.destinationModuleName,
      });
      setSelectDestinationModule(editRowData.destinationModuleName);
      getModuleFieldDetails(editRowData.destinationModuleName, true);

      // Populate source field
      setFieldValue("Field", {
        label: editRowData.sourceName,
        value: editRowData.sourceName,
      });
      setModuleFieldValue(editRowData.sourceName);

      // Populate source value
      setFieldValue("Value", editRowData.sourceValue);
      setFieldValue("FieldValueAndValue", {
        field: editRowData.sourceValue,
        value: editRowData.sourceValue,
      });

      // Populate destination fields and their values
      const endValues = editRowData.destinationData.map((destination) => ({
        value: destination.destinationName,
        label: destination.destinationName,
        id: destination.destinationId,
      }));
      setFieldValue("end", endValues);
      setFieldValue(
        "valueEnd",
        editRowData.destinationData.map((d) => d.destinationValue)
      );

      // Set sourceId for the update API call
      setSourceId(editRowData.sourceId);
      setDestinationData(editRowData.destinationData);
    }
  }, [editRowData]);

  useEffect(() => {
    getAllConnect();
  }, []);

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  const getCustomValue = (value) => {
    Api.get("api/v1/library/get/separate/module/data", {
      params: { moduleName: selectModule, fieldId: value?.id?._id },
    }).then((res) => {
      setSeparateData(res.data.getData);
    });
  };

  const getDestinationValue = (selectedOptions) => {
    const optionsArray = Array.isArray(selectedOptions)
      ? selectedOptions
      : [selectedOptions];

    Promise.all(
      optionsArray.map((option) =>
        Api.get("api/v1/library/get/separate/module/destination/data", {
          params: {
            moduleName: selectDestinationModule,
            fieldId: option.id,
          },
        }).then((res) => ({ label: option.label, data: res.data.getData }))
      )
    )
      .then((results) => {
        // FIX: Update the Map immutably — one entry per field label.
        // This guarantees that fetching options for field "X" never causes
        // field "Y"'s input to re-mount and lose its typed value.
        setSeparateDestinationData((prev) => {
          const next = new Map(prev);
          results.forEach(({ label, data }) => next.set(label, data));
          return next;
        });
      })
      .catch((error) => console.error("Error fetching destination data:", error));
  };

  const filterDestinationOptions = (fieldLabel) => {
    const data = separateDestinationData.get(fieldLabel);
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      value: item.sourceValue,
      label: item.sourceValue,
      id: item,
    }));
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div>
            {/*
              FIX: Removed enableReinitialize={true}.
              enableReinitialize causes Formik to reset the entire form whenever
              initialValues changes — which happened on every state update (selectModule,
              moduleFieldValue, etc.), wiping out in-progress edits.

              Instead, we use a ref (formikRef) to access setFieldValue imperatively
              inside the editRowData useEffect above, populating edit values only once
              when the user clicks Edit, with no further interference.
            */}
            <Formik
              innerRef={formikRef}
              initialValues={EMPTY_INITIAL_VALUES}
              onSubmit={(values, { resetForm }) => {
                if (isUpdating) return;
                const customErrors = validateSameSourceDestination(values);
                if (Object.keys(customErrors).length === 0) {
                  editRowData
                    ? updateConnectLibrary(values, { resetForm })
                    : createConnectLibrary(values, { resetForm });
                }
              }}
              validationSchema={validation}
              validate={validateSameSourceDestination}
            >
              {(formikProps) => {
                const {
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  values,
                  resetForm,
                  touched,
                  errors,
                } = formikProps;

                return (
                  <Form onSubmit={handleSubmit}>
                    <div className="connected">
                      <div className="mttr-sec mt-4 mb-2">
                        <p className=" mb-0 para-tag">Connected Library</p>
                      </div>
                      {hasWritePermission() ? (
                        <Card className="mt-2 mttr-card p-4 ">
                          <Row>
                            {/* ── Module ── */}
                            <Col className="col-lg-4 mt-2">
                              <Label>Module</Label>
                              <Form.Group>
                                <Select
                                  value={
                                    values.Module
                                      ? { value: values.Module.value, label: values.Module.label }
                                      : null
                                  }
                                  onChange={(e) => {
                                    // FIX: Use setFieldValue directly instead of setting
                                    // local state that would trigger reinitialization.
                                    setSelectModule(e.value);
                                    setFieldValue("Module", { label: e.value, value: e.value });
                                    setFieldValue("Field", "");
                                    setFieldValue("end", []);
                                    setFieldValue("valueEnd", []);
                                    setFieldValue("FieldValueAndValue", { field: "", value: "" });
                                    getModuleFieldDetails(e.value, false);
                                    getAllConnect(e.value);
                                  }}
                                  placeholder="Select Module"
                                  name="Module"
                                  styles={customStyles}
                                  options={[
                                    { value: "FMECA", label: "FMECA" },
                                    { value: "SAFETY", label: "SAFETY" },
                                    { value: "PMMRA", label: "PMMRA" },
                                    { value: "MTTR", label: "MTTR" },
                                  ]}
                                />
                                <ErrorMessage
                                  component="span"
                                  name="Module"
                                  className="error text-danger"
                                />
                              </Form.Group>
                            </Col>

                            {/* ── Source Field ── */}
                            <Col className="col-lg-4 mt-2">
                              <Label>Source</Label>
                              <Form.Group>
                                <Select
                                  value={
                                    values.Field
                                      ? { value: values.Field.value, label: values.Field.label }
                                      : null
                                  }
                                  onChange={(e) => {
                                    // FIX: Set all field values directly; no state-driven
                                    // reinitialization needed.
                                    setFieldValue("Field", { label: e.label, value: e.value });
                                    setFieldValue("Value", "");
                                    setFieldValue("FieldValueAndValue", { field: e.value, value: "" });
                                    setModuleFieldValue(e.value);
                                    setSourceId(e.id._id);
                                    getCustomValue(e);
                                  }}
                                  placeholder="Select Field"
                                  name="Field"
                                  styles={customStyles}
                                  options={
                                    selectModule && moduleData
                                      ? [
                                          {
                                            options: moduleData
                                              .filter((item) => item.name !== values.Field?.value)
                                              .map((list) => ({
                                                value: list.name,
                                                label: list.key,
                                                id: list,
                                              })),
                                          },
                                        ]
                                      : []
                                  }
                                />
                                <ErrorMessage
                                  component="span"
                                  name="Field"
                                  className="error text-danger"
                                />
                              </Form.Group>
                            </Col>

                            {/* ── Source Value ── */}
                            {values?.Field ? (
                              <Col className="col-lg-4 mt-2">
                                <Label>
                                  Enter custom value for {values.Field.label}
                                  {(values.Field?.value === "endEffectRatioBeta" ||
                                    values.Field?.value === "failureModeRatioAlpha") &&
                                    " (must be less than 1)"}
                                </Label>
                                <Form.Group>
                                  {namesToFilter.includes(values.Field?.value) ? (
                                    <Select
                                      name="FieldValueAndValue"
                                      className="mt-1"
                                      placeholder={`Select value for ${values.Field.label}`}
                                      value={
                                        values.FieldValueAndValue?.value
                                          ? {
                                              label: values.FieldValueAndValue.value,
                                              value: values.FieldValueAndValue.value,
                                            }
                                          : null
                                      }
                                      options={[
                                        { label: "Yes", value: "Yes" },
                                        { label: "No", value: "No" },
                                      ]}
                                      onBlur={handleBlur}
                                      onChange={(selectedOption) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: selectedOption?.value || "",
                                        });
                                      }}
                                      styles={customStyles}
                                    />
                                  ) : values.Field?.value === "endEffectRatioBeta" ||
                                    values.Field?.value === "failureModeRatioAlpha" ? (
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="0.99"
                                      placeholder="Enter value between 0 and 1"
                                      value={values.FieldValueAndValue.value || ""}
                                      onChange={(e) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: e.target?.value,
                                        });
                                      }}
                                      onBlur={handleBlur}
                                      isInvalid={errors.FieldValueAndValue?.value}
                                    />
                                  ) : separateData?.length > 0 ? (
                                    <CreatableSelect
                                      value={
                                        values.FieldValueAndValue?.value
                                          ? {
                                              value: values.FieldValueAndValue.value,
                                              label: values.FieldValueAndValue.value,
                                            }
                                          : null
                                      }
                                      onChange={(selectedOption) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: selectedOption?.value || "",
                                        });
                                      }}
                                      onCreateOption={(inputValue) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: inputValue,
                                        });
                                      }}
                                      isClearable
                                      placeholder="Select or type a new value"
                                      options={separateData.map((list) => ({
                                        value: list.sourceValue,
                                        label: list.sourceValue,
                                        id: list,
                                      }))}
                                      styles={customStyles}
                                    />
                                  ) : (
                                    <Form.Control
                                      placeholder={`Enter custom value for ${values.Field.label}`}
                                      value={values.FieldValueAndValue.value || ""}
                                      onChange={(e) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: e.target?.value,
                                        });
                                      }}
                                      onBlur={handleBlur}
                                      isInvalid={errors.FieldValueAndValue?.value}
                                    />
                                  )}
                                  {errors.FieldValueAndValue?.value && (
                                    <div className="error text-danger mt-1">
                                      {errors.FieldValueAndValue.value}
                                    </div>
                                  )}
                                </Form.Group>
                              </Col>
                            ) : null}

                            {/* ── Destination Module ── */}
                            <Col className="col-lg-4 mt-2">
                              <Label>Destination Module</Label>
                              <Form.Group>
                                <Select
                                  value={
                                    values.destinationModule
                                      ? {
                                          value: values.destinationModule.value,
                                          label: values.destinationModule.label,
                                        }
                                      : null
                                  }
                                  onChange={(e) => {
                                    // FIX: Capture current source values before async state
                                    // changes could interfere, then restore them explicitly.
                                    const currentField = values.Field;
                                    const currentFieldValue = values.FieldValueAndValue;

                                    setSelectDestinationModule(e.value);
                                    setFieldValue("destinationModule", { label: e.value, value: e.value });
                                    setFieldValue("end", []);
                                    setFieldValue("valueEnd", []);
                                    setSeparateDestinationData(new Map()); // clear stale per-field options
                                    getModuleFieldDetails(e.value, true);

                                    // Restore source selections that must not be cleared
                                    setTimeout(() => {
                                      if (currentField) setFieldValue("Field", currentField);
                                      if (currentFieldValue)
                                        setFieldValue("FieldValueAndValue", currentFieldValue);
                                    }, 0);
                                  }}
                                  placeholder="Select Destination Module"
                                  name="destinationModule"
                                  styles={customStyles}
                                  options={[
                                    { value: "FMECA", label: "FMECA" },
                                    { value: "SAFETY", label: "SAFETY" },
                                    { value: "PMMRA", label: "PMMRA" },
                                    { value: "MTTR", label: "MTTR" },
                                  ]}
                                />
                                {errors.destinationModule &&
                                  typeof errors.destinationModule === "string" && (
                                    <div className="error text-danger">
                                      {errors.destinationModule}
                                    </div>
                                  )}
                              </Form.Group>
                            </Col>

                            {/* ── Destination Fields ── */}
                            <Col className="col-lg-4 mt-2">
                              <Label>Destination</Label>
                              <Form.Group>
                                <Select
                                  isMulti
                                  value={values.end}
                                  onChange={(selectedOptions) => {
                                    const currentEnd = values.end || [];
                                    const currentValueEnd = values.valueEnd || [];

                                    const addedOptions = selectedOptions.filter(
                                      (sel) =>
                                        !currentEnd.some((option) => option.value === sel.value)
                                    );

                                    const newValueEnd = selectedOptions.map((option) => {
                                      const existingIndex = currentEnd.findIndex(
                                        (opt) => opt.value === option.value
                                      );
                                      return existingIndex !== -1
                                        ? currentValueEnd[existingIndex] || ""
                                        : "";
                                    });

                                    setFieldValue("end", selectedOptions);
                                    setFieldValue("valueEnd", newValueEnd);

                                    if (addedOptions.length > 0) {
                                      getDestinationValue(addedOptions);
                                    }
                                  }}
                                  placeholder="Select Field"
                                  name="end"
                                  options={
                                    destinationModuleData && values.Field
                                      ? destinationModuleData
                                          .filter((item) => item.name !== values.Field?.value)
                                          .map((list) => ({
                                            value: list.name,
                                            label: list.key,
                                            id: list,
                                          }))
                                      : []
                                  }
                                />
                                {errors.end && typeof errors.end === "string" && (
                                  <div className="error text-danger">{errors.end}</div>
                                )}
                              </Form.Group>
                            </Col>

                            {/* ── Destination Value Inputs ── */}
                            {values.end &&
                              values.end.length > 0 &&
                              values.end.map((selectedOption, index) => (
                                <Col key={index} className="col-lg-4 mt-2">
                                  <Label>
                                    Custom Value for {selectedOption.label}
                                    {(selectedOption?.value === "endEffectRatioBeta" ||
                                      selectedOption?.value === "failureModeRatioAlpha") &&
                                      " (must be less than 1)"}
                                  </Label>
                                  <Form.Group>
                                    {namesToFilter.includes(selectedOption.value) ? (
                                      <Form.Select
                                        className="mt-1"
                                        name={`valueEnd[${index}]`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.valueEnd[index] || ""}
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </Form.Select>
                                    ) : selectedOption?.value === "endEffectRatioBeta" ||
                                      selectedOption?.value === "failureModeRatioAlpha" ? (
                                      <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="0.99"
                                        name={`valueEnd[${index}]`}
                                        placeholder={`Enter value between 0 and 1 for ${selectedOption.label}`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.valueEnd[index] || ""}
                                      />
                                    ) : separateDestinationData.has(selectedOption.label) ? (
                                      // FIX: Check the Map for THIS field specifically.
                                      // Previously used separateDestinationData.length > 0 (the old array),
                                      // which meant ANY field loading its options would switch ALL inputs
                                      // from Form.Control to CreatableSelect, destroying typed values.
                                      // Now each input independently checks its own entry in the Map,
                                      // so it only switches to CreatableSelect when its own options arrive.
                                      <CreatableSelect
                                        value={
                                          values.valueEnd[index]
                                            ? {
                                                value: values.valueEnd[index],
                                                label: values.valueEnd[index],
                                              }
                                            : null
                                        }
                                        onChange={(selected) => {
                                          setFieldValue(`valueEnd[${index}]`, selected?.value || "");
                                        }}
                                        onCreateOption={(inputValue) => {
                                          setFieldValue(`valueEnd[${index}]`, inputValue);
                                        }}
                                        isClearable
                                        placeholder={`Select or type a value for ${selectedOption.label}`}
                                        options={filterDestinationOptions(selectedOption.label)}
                                        styles={customStyles}
                                      />
                                    ) : (
                                      <Form.Control
                                        type="text"
                                        name={`valueEnd[${index}]`}
                                        placeholder={`Enter custom value for ${selectedOption.label}`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.valueEnd?.[index] || ""}
                                        isInvalid={errors.valueEnd && errors.valueEnd[index]}
                                      />
                                    )}
                                    <ErrorMessage
                                      component="span"
                                      name={`valueEnd[${index}]`}
                                      className="error text-danger"
                                    />
                                  </Form.Group>
                                </Col>
                              ))}

                            {/* ── Buttons ── */}
                            <div className="d-flex flex-direction-row justify-content-end mt-4 mb-2">
                              <Button
                                className="delete-cancel-btn me-2"
                                variant="outline-secondary"
                                type="reset"
                                onClick={() => {
                                  resetForm({ values: EMPTY_INITIAL_VALUES });
                                  resetFormFields();
                                }}
                              >
                                CANCEL
                              </Button>
                              {editRowData ? (
                                <Button
                                  className="save-btn"
                                  type="submit"
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <>
                                      <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                      />
                                      Updating...
                                    </>
                                  ) : (
                                    "UPDATE"
                                  )}
                                </Button>
                              ) : (
                                <Button className="save-btn" type="submit">
                                  CREATE
                                </Button>
                              )}
                            </div>
                          </Row>
                        </Card>
                      ) : null}
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>

          {/* ── Table ── */}
          <div>
            <MaterialTable
              title="Connected Library"
              data={connectData}
              columns={columns}
              icons={tableIcons}
              style={{ marginTop: "0px" }}
              actions={
                hasWritePermission()
                  ? [
                      (rowData) => ({
                        icon: () => (
                          <Row>
                            <Col>
                              <FontAwesomeIcon
                                icon={faEdit}
                                style={{ fontSize: "20px" }}
                                title="Edit"
                              />
                            </Col>
                          </Row>
                        ),
                        onClick: () => {
                          setEditRowData(rowData);
                          scrollToTop();
                        },
                      }),
                      (rowData) => ({
                        icon: () => (
                          <Row>
                            <Col>
                              <FontAwesomeIcon
                                title="Delete"
                                icon={faTrash}
                                style={{ color: "red", fontSize: "20px" }}
                              />
                            </Col>
                          </Row>
                        ),
                        onClick: () => deleteConnectLibarary(rowData),
                      }),
                    ]
                  : undefined
              }
              options={{
                cellStyle: { border: "1px solid #eee" },
                addRowPosition: "first",
                actionsColumnIndex: -1,
                headerStyle: { backgroundColor: "#CCE6FF", zIndex: 0 },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectedLibrary;