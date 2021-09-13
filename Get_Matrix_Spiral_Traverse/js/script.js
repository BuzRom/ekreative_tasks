'use strict'

const getMatrix = (column, row) => {
   const matrix = [];
   let counter = 1;
   for (let i = 0; i < row; i++) {
      matrix[i] = [];
      for (let j = 0; j < column; j++) {
         matrix[i].push(counter);
         counter++;
      }
   }
   return matrix;
}

const getSpiralTraverse = (column, row, arr, direction) => {
   const res = [];
   let endCol = column - 1;
   let startCol = column - 1;
   let endRow = row - 1;
   let startRow = row - 1;
   let counter = 0;
   const arrLength = [].concat(...arr);

   while (arrLength.length != res.length) {
      const goLeft = () => {
         for (let i = 0; i <= counter; i++) {
            if (endRow < 0 || startCol - i < 0 || endRow > arr.length - 1 || startCol - i > arr[0].length - 1) {
               continue;
            }
            else {
               res.push(arr[endRow][startCol - i]);
            }
         }
         endCol--;
      };

      const goUp = () => {
         for (let i = 0; i <= counter; i++) {
            if (endRow - i < 0 || endCol < 0 || endRow - i > arr.length - 1 || endCol > arr[0].length - 1) {
               continue;
            }
            else {
               res.push(arr[endRow - i][endCol]);
            }
         }
         startRow--;
      };

      const goRight = () => {
         for (let i = 0; i <= counter; i++) {
            if (startRow < 0 || endCol + i < 0 || startRow > arr.length - 1 || endCol + i > arr[0].length - 1) {
               continue;
            }
            else {
               res.push(arr[startRow][endCol + i]);
            }
         }
         startCol++;
      }

      const goDown = () => {
         for (let i = 0; i <= counter; i++) {
            if (startRow + i < 0 || startCol < 0 || startRow + i > arr.length - 1 || startCol > arr[0].length - 1) {
               continue;
            }
            else {
               res.push(arr[startRow + i][startCol]);
            }
         }
         endRow++;
      };

      switch (direction) {
         case ('left'):
            goLeft();
            goUp();
            counter++;
            goRight();
            goDown();
            counter++;
            break;

         case ('up'):
            goUp();
            goRight();
            counter++;
            goDown();
            goLeft();
            counter++;
            break;

         case ('right'):
            goRight();
            goDown();
            counter++;
            goLeft();
            goUp();
            counter++;
            break;

         case ('down'):
            goDown();
            goLeft();
            counter++;
            goUp();
            goRight();
            counter++;
            break;

         default:
            goLeft();
            goUp();
            counter++;
            goRight();
            goDown();
            counter++;
            break;
      }
   }
   return res;
}

const getResult = (column, row, startColumn, startRow, direction) => {
   const matrix = getMatrix(column, row);
   const result = getSpiralTraverse(startColumn, startRow, matrix, direction);
   return result;
}

const form = document.querySelector('.form');
form.addEventListener('submit', e => {
   e.preventDefault();

   const table = document.querySelector('table');
   table.innerHTML = '';
   table.setAttribute('style', 'text-align: center; border-collapse: collapse; width: 100%;');

   const column = Math.abs(form.columns.value);
   const row = Math.abs(form.rows.value);
   const startColumn = Math.abs(form.startColumn.value);
   const startRow = Math.abs(form.startRow.value);
   const direction = form.direction.value;

   (function getTable(column, row) {
      let counter = 1;
      for (let i = 0; i < row; i++) {
         let tr = document.createElement('tr');
         table.appendChild(tr);
         for (let j = 0; j < column; j++) {
            let td = document.createElement('td');
            td.textContent = counter;
            tr.appendChild(td);
            td.setAttribute('style', 'font-weight: normal; font-size: 18px; border: 1px solid #000;');
            counter++;
         }
      }
   })(column, row);

   const result = document.querySelector('.result');
   result.innerHTML = '';
   const res = getResult(column, row, startColumn, startRow, direction).join('.');
   result.textContent = res;
})
