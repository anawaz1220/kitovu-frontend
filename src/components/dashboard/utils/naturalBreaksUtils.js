// src/components/dashboard/utils/naturalBreaksUtils.js

/**
 * Calculate natural breaks (Jenks algorithm) for a dataset
 * @param {Array<number>} data - Array of numeric values
 * @param {number} numClasses - Number of classes to create (default: 5)
 * @returns {Array<number>} - Array of break points
 */
export const calculateJenksBreaks = (data, numClasses = 5) => {
    // Handle edge cases
    if (!data || data.length === 0) return [];
    if (data.length <= numClasses) return [...data].sort((a, b) => a - b);
    
    // Filter out non-numeric or negative values and sort
    const validData = data
      .filter(d => typeof d === 'number' && !isNaN(d) && isFinite(d))
      .sort((a, b) => a - b);
    
    if (validData.length === 0) return [];
    if (validData.length <= numClasses) return validData;
    
    // Simple implementation of Jenks Natural Breaks
    // Matrix for storing goodness of variance fit values
    const mat1 = Array(validData.length + 1)
      .fill()
      .map(() => Array(numClasses + 1).fill(0));
    
    // Matrix for storing optimal class breaks
    const mat2 = Array(validData.length + 1)
      .fill()
      .map(() => Array(numClasses + 1).fill(0));
    
    // Initialize variables for sums and squared sums
    let sum = 0;
    let sumSquares = 0;
    
    // Initialize first row of matrices
    for (let i = 1; i <= validData.length; i++) {
      const val = validData[i - 1];
      mat1[i][1] = mat1[i - 1][1] + val;
      mat2[i][1] = mat2[i - 1][1] + val * val;
    }
    
    // Fill the matrices
    for (let j = 2; j <= numClasses; j++) {
      for (let i = j; i <= validData.length; i++) {
        let bestGVF = Infinity;
        let bestIndex = 0;
        
        for (let k = j - 1; k < i; k++) {
          const leftSum = mat1[k][j - 1];
          const rightSum = mat1[i][1] - leftSum;
          
          const leftSumSquares = mat2[k][j - 1];
          const rightSumSquares = mat2[i][1] - leftSumSquares;
          
          const leftCount = k;
          const rightCount = i - k;
          
          const leftMean = leftSum / leftCount;
          const rightMean = rightSum / rightCount;
          
          const leftGVF = leftSumSquares - leftSum * leftSum / leftCount;
          const rightGVF = rightSumSquares - rightSum * rightSum / rightCount;
          
          const gvf = leftGVF + rightGVF;
          
          if (gvf < bestGVF) {
            bestGVF = gvf;
            bestIndex = k;
          }
        }
        
        mat1[i][j] = bestGVF;
        mat2[i][j] = bestIndex;
      }
    }
    
    // Extract the breaks
    const breaks = [];
    let currentIndex = validData.length;
    
    breaks.push(validData[validData.length - 1]); // Add maximum value
    
    for (let j = numClasses; j > 1; j--) {
      currentIndex = mat2[currentIndex][j];
      breaks.push(validData[currentIndex - 1]);
    }
    
    breaks.push(validData[0]); // Add minimum value
    breaks.reverse(); // Reverse to get ascending order
    
    return breaks;
  };
  
  /**
   * Get color for a value based on its position within breaks
   * @param {number} value - The value to get color for
   * @param {Array<number>} breaks - Array of break points
   * @param {Array<string>} colors - Array of color values (hex codes)
   * @returns {string} - Hex color code
   */
  export const getColorFromBreaks = (value, breaks, colors) => {
    if (!value || isNaN(value)) return colors[0];
    
    for (let i = 0; i < breaks.length - 1; i++) {
      if (value >= breaks[i] && value <= breaks[i + 1]) {
        return colors[i];
      }
    }
    
    return colors[colors.length - 1];
  };
  
  /**
   * Generate legend labels from break points
   * @param {Array<number>} breaks - Array of break points
   * @returns {Array<string>} - Array of formatted labels
   */
  export const generateLabelsFromBreaks = (breaks) => {
    if (!breaks || breaks.length < 2) return ['No data'];
    
    const labels = [];
    
    // Format single value for first break
    if (breaks[0] === breaks[1]) {
      labels.push(`${breaks[0]}`);
    } else {
      labels.push(`${breaks[0]} - ${breaks[1]}`);
    }
    
    // Format range for middle breaks
    for (let i = 1; i < breaks.length - 1; i++) {
      labels.push(`${breaks[i]} - ${breaks[i + 1]}`);
    }
    
    // Format "and above" for last break
    if (breaks.length > 2 && breaks[breaks.length - 2] !== breaks[breaks.length - 1]) {
      labels[labels.length - 1] = `${breaks[breaks.length - 2]}+`;
    }
    
    return labels;
  };