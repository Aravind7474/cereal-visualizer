# 🍽️ Cereal Nutritional Visualizer

This is a web-based interactive visualization system built using "D3.js" that explores the "nutritional profile of breakfast cereals". The project is part of the **Information Visualization coursework** and demonstrates multiple coordinated visualizations and interactions.

## 🔍 Overview

The goal of this system is to help users:
- Identify "healthy cereals" (low sugar, high fiber)
- Discover "clusters" of cereals based on nutrition
- Compare "brand-wise product ratings"

## 📊 Visualizations Included

| Visualization | Description |
|---------------|-------------|
| "Scatter Plot" | Plots sugar vs. fiber content to help identify healthier choices |
| "Parallel Coordinates Plot" | Multi-dimensional view of nutrients like calories, fat, protein, etc. |
| "Grouped Bar Chart" | Compares average ratings across different cereal brands |

Each visualization is "interactive" and coordinated, enabling users to explore insights across views.

## 🛠️ Technologies Used

- [D3.js v7](https://d3js.org)
- HTML5, CSS3, JavaScript
- Dataset: `a1-cereals.csv`

## 📁 File Structure

project/ 
├── index.html # Main HTML file 
├── css/ 
│ └── style.css # Custom styles 
├── js/ 
│ ├── scatter.js # Scatter plot logic 
│ ├── parallel.js # Parallel coordinates logic 
│ └── barchart.js # Grouped bar chart logic 
├── data/ 
│ └── a1-cereals.csv # Dataset file 
├── README.md # This file


