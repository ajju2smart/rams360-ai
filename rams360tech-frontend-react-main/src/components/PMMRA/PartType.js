import PMMRA from ".";

export const PartType = [
  { value: "Accumulator", label: "Accumulator" },
  { value: "Actuator", label: "Actuator" },
  { value: "Alarm", label: "Alarm" },
  { value: "Antenna", label: "Antenna" },
  { value: "Battery", label: "Battery" },
  { value: "Bearing", label: "Bearing" },
  { value: "Belt", label: "Belt" },
  { value: "Blower", label: "Blower" },
  { value: "Brake", label: "Brake" },
  { value: "Bushing", label: "Bushing" },
  { value: "Cable", label: "Cable" },
  { value: "Clutch", label: "Clutch" },
  { value: "Computer peripheral", label: "Computer peripheral" },
  { value: "Counter & Timer", label: "Counter & Timer" },
  { value: "Fitting", label: "Fitting" },
  { value: "Gear", label: "Gear" },
  { value: "Generator", label: "Generator" },
  { value: "Keyboard", label: "Keyboard" },
  { value: "Mechanical Filter", label: "Mechanical Filter" },
  { value: "Power supply", label: "Power supply" },
  { value: "Pump", label: "Pump" },
  { value: "Regulator", label: "Regulator" },
  { value: "Solenoid", label: "Solenoid" },
  { value: "Synchro", label: "Synchro" },
  { value: "Transducer", label: "Transducer" },
  { value: "Valve", label: "Valve" },
  { value: "Accelerometer", label: "Accelerometer" },
  { value: "Air Conditioner", label: "Air Conditioner" },
  { value: "Axle", label: "Axle" },
  { value: "Bellows", label: "Bellows" },
  { value: "Bracket", label: "Bracket" },
  { value: "Brush", label: "Brush" },
  { value: "Bus Connection", label: "Bus Connection" },
  { value: "Clamp", label: "Clamp" },
  { value: "Compressor", label: "Compressor" },
  { value: "Connector Accessory", label: "Connector Accessory" },
  { value: "Contact", label: "Contact" },
  { value: "Coupling", label: "Coupling" },
  { value: "Crank", label: "Crank" },
  { value: "Detector", label: "Detector" },
  { value: "Drive", label: "Drive" },
  { value: "Drum", label: "Drum" },
  { value: "Duct", label: "Duct" },
  { value: "Engine", label: "Engine" },
  { value: "Fasteners", label: "Fasteners" },
  { value: "Gauge", label: "Gauge" },
  { value: "Gyros", label: "Gyros" },
  { value: "Gyroscope", label: "Gyroscope" },
  { value: "Heat exchangers", label: "Heat exchangers" },
  { value: "Headter", label: "Headter" },
  { value: "Hose", label: "Hose" },
  { value: "Housing", label: "Housing" },
  { value: "Igniter", label: "Igniter" },
  { value: "Indicator", label: "Indicator" },
  { value: "Insulator", label: "Insulator" },
  { value: "Lens", label: "Lens" },
  { value: "Light", label: "Light" },
  { value: "Manifold", label: "Manifold" },
  { value: "Module", label: "Module" },
  { value: "Motor", label: "Motor" },
  { value: "Mount", label: "Mount" },
  { value: "Nut", label: "Nut" },
  { value: "Optical", label: "Optical" },
  { value: "Pin mechanical", label: "Pin mechanical" },
  { value: "Printer", label: "Printer" },
  { value: "Pulley", label: "Pulley" },
  { value: "Seal", label: "Seal" },
  { value: "Sensor", label: "Sensor" },
  { value: "Shaft", label: "Shaft" },
  { value: "Shock absorber", label: "Shock absorber" },
  { value: "Spring", label: "Spring" },
  { value: "Starter", label: "Starter" },
  { value: "Tank", label: "Tank" },
  { value: "Telescope", label: "Telescope" },
  { value: "Terminal Connection", label: "Terminal Connection" },
  { value: "Tubing", label: "Tubing" },
  { value: "Washer", label: "Washer" },
];

export const repairable = [
  { value: "Repairable 1", label: "Repairable 1" },
  { value: "Repairable 2", label: "Repairable 2" },
];
export const replace = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const levelreplace = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Repairable = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Spare = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const severity = [
  { value: "Spare1", label: "Spare 1" },
  { value: "Spare2", label: "Spare 2" },
  { value: "Spare3", label: "Spare 3" },
];
export const Risk = [
  { value: "risk 1", label: "risk 1" },
  { value: "risk 2", label: "risk 2" },
  { value: "risk 3", label: "risk 3" },
];
export const Category = [
  { value: "Electronic", label: "Electronic" },
  { value: "Mechanical", label: "Mechanical" },
  { value: "Assembly", label: "Assembly" },
];
export const Evident = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Item = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Condition = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Failure = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Redesign = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const acceptable = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Lubrication = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const task = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Combination = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];
export const Frequency = [
  { value: "Days", label: "Days" },
  { value: "Months", label: "Months" },
  { value: "Years", label: "Years" },
  { value: "Kilometers", label: "Kilometers" },
  { value: "Miles", label: "Miles" },
  { value: "Cycles", label: "Cycles" },
];