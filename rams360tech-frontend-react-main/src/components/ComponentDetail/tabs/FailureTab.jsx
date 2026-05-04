import React from "react";
import { useHistory } from "react-router-dom";

function ModulePanel({ title, description, productName, onOpen, disabled, icon }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 24px",gap:16,textAlign:"center" }}>
      <div style={{ fontSize:40,opacity:0.25 }}>{icon}</div>
      <div>
        <div style={{ fontWeight:600,fontSize:15,color:"var(--color-text)",marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:13,color:"var(--color-text-muted)",maxWidth:360 }}>
          {description}{productName && <> — <strong>{productName}</strong></>}
        </div>
      </div>
      <button onClick={onOpen} disabled={disabled} style={{ marginTop:8,padding:"9px 24px",background:disabled?"#e2e8f0":"var(--color-brand)",color:disabled?"var(--color-text-muted)":"#fff",border:"none",borderRadius:"var(--radius-md,8px)",fontWeight:600,fontSize:13,cursor:disabled?"not-allowed":"pointer" }}>
        {disabled ? "Select a component first" : "Open " + title + " →"}
      </button>
    </div>
  );
}

export default function FailureTab({ data, projectId }) {
  const history = useHistory();
  const productId = data?.id || data?.productId;
  const openModule = () => {
    history.push({ pathname: "/mttr/prediction/" + projectId, state: { projectId, productId, productName: data?.productName } });
  };
  return (
    <div className="form-section">
      <div className="form-section__header">Failure Prediction (MTTR)</div>
      <div className="form-section__body">
        <ModulePanel title="Failure Prediction" description="MTTR / failure rate prediction for this component." productName={data?.productName} onOpen={openModule} disabled={!productId} icon="📊" />
      </div>
    </div>
  );
}
