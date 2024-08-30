import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import ws from './ws';
import { FaUndo, FaRedo, FaEraser, FaTrash, FaTimes, FaPen } from 'react-icons/fa';
import { containerStyle, controlsStyle, inputStyle, iconStyle, canvasStyle } from './styles';

const Canvas = () => {
  const canvasRef = useRef();
  const [path, setPath] = useState([]);
  const [strokeColor, setStrokeColor] = useState('black');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);  // Flag to prevent the loop
  const [eraserWidth, setEraserWidth] = useState(5);
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onopen = function open() {
    console.log('WebSocket connection established');
  };

  ws.onmessage = async function message(event) {
    const data = JSON.parse(event.data);
    setIsLoadingPaths(true);  // Set the flag before loading paths
    setPath(data);
    await handleLoad(data);
    setIsLoadingPaths(false);  // Reset the flag after loading paths
  };

  const handleGetPaths = async () => {
    if (isLoadingPaths) return;  // Prevent sending paths if loading from WebSocket

    if (canvasRef.current) {
      const res = await canvasRef.current.exportPaths();
      if (JSON.stringify(res) !== JSON.stringify(path)) {  // Compare paths before sending
        setPath(res);
        ws.send(JSON.stringify(res));
      }
    }
  };

  const handleLoad = async (paths) => {
    console.log(canvasRef.current)
    await canvasRef.current.clearCanvas();
    await canvasRef.current.loadPaths(paths);
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
        <FaPen style={iconStyle} title="Pen" onClick={async () => await canvasRef.current.eraseMode(false)} />
        <input
          type="number"
          style={{ ...inputStyle, width: '30px' }}
          onChange={(e) => setEraserWidth(Number(e.target.value))}
        />
        <FaEraser style={iconStyle} title="Erase" onClick={async () => await canvasRef.current.eraseMode(true)} />
        <FaUndo style={iconStyle} title="Undo" onClick={async () => await canvasRef.current.undo()} />
        <FaRedo style={iconStyle} title="Redo" onClick={async () => await canvasRef.current.redo()} />
        <FaTimes style={iconStyle} title="Clear" onClick={async () => await canvasRef.current.clearCanvas()} />
        <FaTrash style={iconStyle} title="Delete" onClick={async () => await canvasRef.current.resetCanvas()} />
      </div>
      <div style={{ width: '80%', maxWidth: '950px', height: '80%', position: 'relative' }}>
        <ReactSketchCanvas
          ref={canvasRef}
          onChange={handleGetPaths}
          strokeWidth={strokeWidth}
          eraserWidth={eraserWidth}
          strokeColor={strokeColor}
          style={canvasStyle}
        />
      </div>
    </div>
  );
};

export default Canvas;
