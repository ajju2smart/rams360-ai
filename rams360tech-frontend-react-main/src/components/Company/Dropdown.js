import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Api from "../../Api";

export default function Dropdown(props) {
  const projectId = props?.value;
  const history = useHistory();
  const [productId, setProductId] = useState(props?.productId ?? null);
  const [productData, setProductData] = useState([]);

  const options = productData.map((list) => ({
    value: list.id,
    label: list.indexCount + "." + list.productName,
    parentId: list.parentId,
  }));
  const selectedOption = options.find((opt) => opt.value === productId) || null;


  const getTreeProduct = () => {
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: { projectId },
    }).then((res) => {
      const treeData = res?.data?.data || [];
      setProductData(treeData);
      if (treeData.length > 0 && !productId) {
        const first = treeData[0];

        setProductId(first.id);

        // ✅ Push first product to history
        history.push({
          pathname: history.location.pathname,
          state: {
            productId: first.id,
            parentId: first.parentId || null,
          },
        });

      } else if (productId) {
        const prevProduct = treeData.find(p => p.id === productId);

        // ✅ Push existing product to history
        history.push({
          pathname: history.location.pathname,
          state: {
            productId: prevProduct?.id,
            parentId: prevProduct?.parentId || null,
          },
        });
      }
    });
  };

  // Load list when project changes
  useEffect(() => {
    getTreeProduct();
  }, [projectId]);


  const getNextProduct = () => {
    if (productData.length === 0) return;
    const currentIndex = productData.findIndex((p) => p.id === productId);
    const nextIndex =
      currentIndex + 1 < productData.length ? currentIndex + 1 : 0;
    const nextProduct = productData[nextIndex];
    setProductId(nextProduct.id);
    setProductId(nextProduct.id);
    history.push({ state: { productId: nextProduct.id, parentId: nextProduct.parentId } });
  };

  const getPreviousProduct = () => {
    if (productData.length === 0) return;
    const currentIndex = productData.findIndex((p) => p.id === productId);
    const prevIndex =
      currentIndex - 1 >= 0 ? currentIndex - 1 : productData.length - 1;
    const prevProduct = productData[prevIndex];
    setProductId(prevProduct.id);
    history.push({ state: { productId: prevProduct.id, parentId: prevProduct.parentId } });
  };


  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#007bff" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: state.isSelected ? "#007bff" : "#f8f9fa",
        color: state.isSelected ? "white" : "black",
      },
    }),
    control: (provided, state) => ({
      ...provided,
      border:
        state.isFocused || state.hasValue
          ? "2px solid #007bff"
          : "1px solid #ced4da",
      borderRadius: "0.375rem",
      boxShadow:
        state.isFocused || state.hasValue
          ? "0 0 0 0.2rem rgba(0, 123, 255, 0.25)"
          : "none",
      "&:hover": {
        border:
          state.isFocused || state.hasValue
            ? "2px solid #007bff"
            : "1px solid #007bff",
      },
    }),
  };

  return (
    <div style={{
      // Reset inherited disabled state from fieldset
      pointerEvents: 'auto',
      opacity: 1,
      display: 'block'
    }}>
      <Row>
        {/* PREVIOUS BUTTON */}
        <Col sm={12} md={4} className="d-flex justify-content-start mt-1">
          <div style={{ marginLeft: "100px" }}>
            <Button className="FRP-button" onClick={getPreviousProduct}>
              {"<< PREV"}
            </Button>
          </div>
        </Col>

        {/* DROPDOWN */}
        <Col sm={12} md={4} className="mt-1 dropdown-Alignments">
          <Select
            styles={customStyles}
            placeholder="Select Product"
            value={selectedOption}
            options={options}
            onChange={(selected) => {
              setProductId(selected.value);
              history.push({ state: { productId: selected.value, parentId: selected.parentId } });
            }}
          />

        </Col>
        <Col sm={12} md={4} className="d-flex justify-content-end mt-1">
          <div style={{ marginLeft: "100px" }}>
            <Button className="FRP-button" onClick={getNextProduct}>
              {"NEXT >>"}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}