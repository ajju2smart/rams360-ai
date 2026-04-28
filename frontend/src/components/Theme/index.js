// Video Watch it

// import React from "react";
// import "../../css/Theme.scss";
// //import "../../css/ProjectList.scss";
// function index() {
//   return (
//     <div className="Theme">
//       <div style={{ backgroundColor: "red" }}>
//         <div>index</div>
//       </div>
//     </div>
//   );
// }

// export default index;

// Chat based working

// import React, { useState } from "react";
// import "../../css/Theme.scss";

// const themes = {
//   light: {
//     backgroundColor: "#ffffff",
//     textColor: "#000000",
//   },
//   dark: {
//     backgroundColor: "#333333",
//     textColor: "#ffffff",
//   },
//   blue: {
//     backgroundColor: "#007bff",
//     textColor: "#ffffff",
//   },
//   green: {
//     backgroundColor: "#28a745",
//     textColor: "#ffffff",
//   },
// };

// function Index() {
//   const [currentTheme, setCurrentTheme] = useState("light");

//   const handleThemeChange = (theme) => {
//     setCurrentTheme(theme);
//   };

//   const theme = themes[currentTheme];

//   return (
//     <div
//       className="appth"
//       style={{
//         backgroundColor: theme.backgroundColor,
//         color: theme.textColor,
//       }}
//     >
//       <header className="header">
//         <h1>Color Theme Switcher</h1>
//       </header>
//       <main className="main-content">
//         <p>This is a sample text in different color themes.</p>
//         <button onClick={() => handleThemeChange("light")}>Light</button>
//         <button onClick={() => handleThemeChange("dark")}>Dark</button>
//         <button onClick={() => handleThemeChange("blue")}>Blue</button>
//         <button onClick={() => handleThemeChange("green")}>Green</button>
//       </main>
//     </div>
//   );
// }

// export default Index;

///check condtion-----be

import { React, useState ,useEffect} from "react";
import { Modal, Button } from "react-bootstrap";
import "../../css/Theme.scss";
import ThemeSlider from "./color";
import Api from "../../Api.js";
import { useAuth } from "../../context/AuthContext";


function Index() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const storedHue = localStorage.getItem("themeHue");
  //const initialHue = storedHue ? parseInt(storedHue, 10) : 0;
  const initialHue = 194;
  const [hue, setHue] = useState(initialHue);
  
  useEffect(() => {
    document.documentElement.style.setProperty("--user-theme-color-hue", initialHue);
  }, []);
  
  const handleConfirm = () => {
    // Reload the page
    const storedHue = initialHue || localStorage.getItem("themeHue");
    const userId = user?._id;
    Api.patch("/api/v1/user/theme/color",{
        userThemeColor : storedHue,
        userId: userId,
    })
    window.location.reload();
  };
  
  return (
    <div className="main-div">
      <div>
        <h1> Change Theme Color</h1>
      </div>
      <ThemeSlider />
      <meta charSet="utf-8" />

      {/* <title className="appth align-line">Margins - LTCN</title> */}
      <link rel="stylesheet" href="Theme.scss" />
      <div>
        <Button className="export-btns apply-btn  position-absolute bottom-25 end-0" onClick={handleShow}>
          Apply
        </Button>
      </div>
      {/* <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}> */}

      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        backdrop="static"
        dialogClassName="custom-modal"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        // style={{ maxHeight: "80%" }}
      >
        <Modal.Body className="custom-modal-body">
          <Modal.Header closeButton>
            <Modal.Title className="model-text">Are You Sure Confirm to Change Theme Color </Modal.Title>
          </Modal.Header>

          <Modal.Footer>
            <Button variant="secondary model-textbtn" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="export-btns model-textbtn" onClick={handleConfirm}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Index;
