const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModels');
const PDFDocument = require('pdfkit');

// GET all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching todos',
      error: error.message
    });
  }
});

// Helper function to draw a table
function drawTable(doc, startY, tableTitle, headers, rows, tableWidth) {
  const rowHeight = 35;
  const colWidths = [40, 180, 180, 100]; // #, Title, Description, Priority
  const tableStartX = 50;
  let currentY = startY;
  const totalRows = rows.length + 2; // +1 for title, +1 for header

  // Draw title row background (spans all columns)
  doc.rect(tableStartX, currentY, tableWidth, rowHeight)
     .fill('#FFFFFF'); // no border for title row
  
  // Draw title text (centered, spans all columns)
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(tableTitle, tableStartX, currentY + 10, {
       width: tableWidth,
       align: 'center'
     });
  
  doc.fillColor('#000000');
  currentY += rowHeight;

  // Draw horizontal line between title and header
  doc.moveTo(tableStartX, currentY)
     .lineTo(tableStartX + tableWidth, currentY)
     .strokeColor('#000000')
     .lineWidth(1)
     .stroke();

  // Draw header row background
  doc.rect(tableStartX, currentY, tableWidth, rowHeight)
     .fillAndStroke('#FFFFFF', '#000000');
  
  // Draw header text
  let currentX = tableStartX;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#000000');
  
  headers.forEach((header, index) => {
    doc.text(header, currentX + 5, currentY + 10, {
      width: colWidths[index] - 10,
      align: 'left'
    });
    // Draw vertical line after column (except last)
    if (index < headers.length - 1) {
      doc.moveTo(currentX + colWidths[index], currentY)
         .lineTo(currentX + colWidths[index], currentY + rowHeight)
         .strokeColor('#000000')
         .lineWidth(1)
         .stroke();
    }
    currentX += colWidths[index];
  });
  
  doc.fillColor('#000000');
  currentY += rowHeight;

  // Draw data rows
  rows.forEach((row, rowIndex) => {
    // Draw row background
    doc.rect(tableStartX, currentY, tableWidth, rowHeight)
       .fillAndStroke('#FFFFFF', '#000000');
    
    // Draw cell content
    currentX = tableStartX;
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#000000');
    
    row.forEach((cell, cellIndex) => {
      doc.text(cell, currentX + 5, currentY + 10, {
        width: colWidths[cellIndex] - 10,
        align: 'left'
      });
      // Draw vertical line after column (except last)
      if (cellIndex < row.length - 1) {
        doc.moveTo(currentX + colWidths[cellIndex], currentY)
           .lineTo(currentX + colWidths[cellIndex], currentY + rowHeight)
           .strokeColor('#000000')
           .lineWidth(0.5)
           .stroke();
      }
      currentX += colWidths[cellIndex];
    });
    
    // Draw horizontal line after row
    doc.moveTo(tableStartX, currentY + rowHeight)
       .lineTo(tableStartX + tableWidth, currentY + rowHeight)
       .strokeColor('#000000')
       .lineWidth(0.5)
       .stroke();
    
    currentY += rowHeight;
  });

  return currentY;
}

// GET download todos as PDF
router.get('/download/pdf', async (req, res) => {
  try {
    // Fetch all todos from MongoDB
    const todos = await Todo.find().sort({ createdAt: -1 });

    // Separate completed and incomplete tasks
    const completedTasks = todos.filter(todo => todo.completed);
    const incompleteTasks = todos.filter(todo => !todo.completed);

    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="my-todo-list.pdf"');

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('My To-Do List', { align: 'center' })
       .moveDown(0.5);

    // Add summary
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Total: ${todos.length} | Completed: ${completedTasks.length} | Incomplete: ${incompleteTasks.length}`, { align: 'center' })
       .fillColor('#000000')
       .moveDown(1);

    const tableWidth = 500;
    const headers = ['#', 'Title', 'Description', 'Priority'];
    let currentY = doc.y;

    // Incomplete Tasks Table
    if (incompleteTasks.length > 0) {
      const incompleteRows = incompleteTasks.map((todo, index) => {
        const description = todo.description ? (todo.description.length > 40 ? todo.description.substring(0, 40) + '...' : todo.description) : '-';
        const priority = todo.priority ? todo.priority.toUpperCase() : '-';
        return [
          (index + 1).toString(),
          todo.title.length > 35 ? todo.title.substring(0, 35) + '...' : todo.title,
          description,
          priority
        ];
      });

      currentY = drawTable(doc, currentY, 'Incomplete Tasks', headers, incompleteRows, tableWidth);
      doc.y = currentY + 20;
    }

    // Completed Tasks Table
    if (completedTasks.length > 0) {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
        currentY = 50;
      } else {
        currentY = doc.y;
      }

      const completedRows = completedTasks.map((todo, index) => {
        const description = todo.description ? (todo.description.length > 40 ? todo.description.substring(0, 40) + '...' : todo.description) : '-';
        const priority = todo.priority ? todo.priority.toUpperCase() : '-';
        return [
          (index + 1).toString(),
          todo.title.length > 35 ? todo.title.substring(0, 35) + '...' : todo.title,
          description,
          priority
        ];
      });

      currentY = drawTable(doc, currentY, 'Completed Tasks', headers, completedRows, tableWidth);
    }

    // If no tasks at all
    if (todos.length === 0) {
      doc.fontSize(14)
         .font('Helvetica')
         .text('No todos found.', { align: 'center' });
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
});

// GET single todo by ID
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching todo',
      error: error.message
    });
  }
});

// POST create new todo
router.post('/', async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating todo',
      error: error.message
    });
  }
});

// PUT update todo
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating todo',
      error: error.message
    });
  }
});

// DELETE delete todo
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting todo',
      error: error.message
    });
  }
});

module.exports = router;
