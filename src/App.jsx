import "./styles.css";
import { default as EscPosEncoder } from "@manhnd/esc-pos-encoder";

const InvoiceColumn = [
  { width: 5, marginRight: 2, align: "left" },
  { width: 10, marginRight: 2, align: "center" },
  { width: 10, align: "right" },
];

const InvoiceColumnHeader = ["QTY", "Item", "Total"];

const getPrintDeviceList = async () => {
  const nvg = navigator;
  const bluetooth = nvg.bluetooth;
  if (nvg && nvg.bluetooth) {
    return await bluetooth.requestDevice({
      filters: [
        {
          services: ["000018f0-0000-1000-8000-00805f9b34fb"],
        },
      ],
    });
  } else {
    throw new Error("Navigator / Bluetooth is not found!");
  }
};

const sendPrintData = async (characteristic) => {
  if (characteristic) {
    console.log("Cache the characteristic", characteristic);
    const data = [
      InvoiceColumnHeader,
      ["1", "Item 1123123", "10000"],
      ["2", "Item 1333", "100000"],
    ];
    let encoder = new EscPosEncoder();
    let result = encoder.table(InvoiceColumn, data).encode();
    // Print text
    return await characteristic.writeValue(result);
  } else {
    throw new Error("characteristic not found!");
  }
};

export default function App() {
  const handlePrint = async () => {
    try {
      const deviceList = await getPrintDeviceList();
      const gatt = await deviceList?.gatt?.connect();
      if (gatt) {
        if (typeof gatt.getPrimaryService === "function") {
          const service = await gatt.getPrimaryService(
            "000018f0-0000-1000-8000-00805f9b34fb"
          );
          if (service) {
            const characteristic = await service.getCharacteristic(
              "00002af1-0000-1000-8000-00805f9b34fb"
            );
            const response = await sendPrintData(characteristic);
            console.log("print result:", response);
          } else {
            console.log("service not found!");
          }
        } else {
          console.log("gatt.getPrimaryService not found!");
        }
      } else {
        console.log("GATT Device not found!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button onClick={async () => await handlePrint()}>PRINT</button>
    </div>
  );
}
