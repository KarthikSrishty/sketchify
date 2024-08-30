import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import ws from './ws';
import { GoPencil } from "react-icons/go";
import { LuEraser } from "react-icons/lu";
import { GrUndo, GrRedo } from "react-icons/gr";
import { MdOutlineClear } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { containerStyle, controlsStyle, canvasStyle, inputStyle, iconStyle } from './styles';

const Canvas = () => {
  const canvasRef = useRef();
  const [path, setPath] = useState([]);
  const [strokeColor, setStrokeColor] = useState('black');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [eraserWidth, setEraserWidth] = useState(5);
  const [selectedTool, setSelectedTool] = useState('pen'); // State to track selected tool
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onopen = function open() {
    console.log('WebSocket connection established');
  };

  ws.onmessage = async function message(event) {
    const data = JSON.parse(event.data);
    setIsLoadingPaths(true);
    setPath(data);
    await handleLoad(data);
    setIsLoadingPaths(false);
  };

  const handleGetPaths = async () => {
    if (isLoadingPaths) return;

    if (canvasRef.current) {
      const res = await canvasRef.current.exportPaths();
      if (JSON.stringify(res) !== JSON.stringify(path)) {
        setPath(res);
        ws.send(JSON.stringify(res));
      }
    }
  };

  const handleLoad = async (paths) => {
    await canvasRef.current.clearCanvas();
    await canvasRef.current.loadPaths(paths);
  };

  const handleToolSelect = async (tool) => {
    setSelectedTool(tool);
    if (tool === 'pen') {
      await canvasRef.current.eraseMode(false);
    } else if (tool === 'eraser') {
      await canvasRef.current.eraseMode(true);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={controlsStyle}>
        <input
          type="number"
          style={inputStyle}
          placeholder="Stroke Width"
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />
        <input
          type="color"
          style={{ ...inputStyle, padding: '0' }}
          onChange={(e) => setStrokeColor(e.target.value)}
        />
        <GoPencil
          style={{
            ...iconStyle,
            color: selectedTool === 'pen' ? 'green' : 'black',
          }}
          title="Pen"
          onClick={() => handleToolSelect('pen')}
        />
        <input
          type="number"
          style={{ ...inputStyle, width: '50px' }}
          onChange={(e) => setEraserWidth(Number(e.target.value))}
        />
        <LuEraser
          style={{
            ...iconStyle,
            color: selectedTool === 'eraser' ? 'green' : 'black',
          }}
          title="Erase"
          onClick={() => handleToolSelect('eraser')}
        />
        <GrUndo
          style={iconStyle}
          title="Undo"
          onClick={async () => await canvasRef.current.undo()}
        />
        <GrRedo
          style={iconStyle}
          title="Redo"
          onClick={async () => await canvasRef.current.redo()}
        />
        <MdOutlineClear
          style={iconStyle}
          title="Clear"
          onClick={async () => await canvasRef.current.clearCanvas()}
        />
        <RiDeleteBin6Line
          style={iconStyle}
          title="Delete"
          onClick={async () => await canvasRef.current.resetCanvas()}
        />
      </div>
      <ReactSketchCanvas
        style={canvasStyle}
        ref={canvasRef}
        onChange={handleGetPaths}
        strokeWidth={strokeWidth}
        eraserWidth={eraserWidth}
        strokeColor={strokeColor}
      />
    </div>
  );
};

export default Canvas;
