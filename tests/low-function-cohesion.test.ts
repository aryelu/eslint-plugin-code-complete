/**
 * @fileoverview Tests for low-function-cohesion rule
 * @author eslint-plugin-my-rules
 */

import { ruleTester } from './config';
import rule from '../rules/low-function-cohesion';

ruleTester.run('low-function-cohesion', rule, {
  valid: [
    // Short function - below minimum length
    `
    function shortFunction() {
      const x = 1;
      if (x > 0) {
        console.log("positive");
      } else {
        console.log("not positive");
      }
    }
    `,
    
    // Function with blocks that share variables
    `
    function wellCohesiveFunction() {
      const data = [];
      const threshold = 10;
      
      // First block
      if (data.length > threshold) {
        data.forEach(item => {
          console.log(item);
        });
      }
      
      // Second block
      for (let i = 0; i < threshold; i++) {
        data.push(i);
      }
    }
    `,
    
    // Function with custom threshold
    {
      code: `
      function customThresholdFunction() {
        const data = [];
        const operations = [];
        
        if (data.length > 0) {
          data.forEach(item => {
            console.log(item);
          });
        }
        
        for (let i = 0; i < 10; i++) {
          operations.push(() => i * 2);
        }
        
        try {
          operations.forEach(op => op());
        } catch (e) {
          console.error("Error in operations");
        }
      }
      `,
      options: [{ minSharedVariablePercentage: 10 }]
    }
  ],

  invalid: [
    // Function with blocks that don't share variables
    {
      code: `
      function processDifferentSets() {
        const users = fetchUsers();
        const products = fetchProducts();
        
        // Block 1 - User processing
        if (users.length > 0) {
          const activeUsers = users.filter(u => u.active);
          const admin = activeUsers.find(u => u.role === 'admin');
          console.log('Admin:', admin);
        }
        
        // Block 2 - Product processing (no shared variables with block 1)
        for (const product of products) {
          if (product.stock < 10) {
            const supplier = getSupplier(product.supplierId);
            orderMoreStock(supplier, product.id);
          }
        }
      }
      `,
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    },
    
    // Multiple disconnected blocks
    {
      code: `
      function processMultipleUnrelatedTasks() {
        // Task 1: User handling
        const users = getUsers();
        if (users.length > 0) {
          for (const user of users) {
            updateUserStatus(user);
          }
        }
        
        // Task 2: Log processing (completely unrelated)
        const logs = getLogs();
        try {
          parseLogs(logs);
        } catch (error) {
          reportLogError(error);
        }
        
        // Task 3: Config updates (also unrelated)
        const config = getConfig();
        if (config.needsUpdate) {
          updateConfig();
        }
      }
      `,
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    },
    
    // Custom options
    {
      code: `
      function customOptionsFunction() {
        const data = [];
        const threshold = 5;
        
        // First block
        if (data.length > 0) {
          const filteredData = data.filter(x => x > threshold);
          console.log(filteredData);
        }
        
        // Second block - very slight overlap
        for (let i = 0; i < 10; i++) {
          const newItem = i * 2;
          if (newItem > threshold) {
            data.push(newItem);
          }
        }
      }
      `,
      options: [{ minSharedVariablePercentage: 50, minFunctionLength: 10 }],
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    }
  ]
}); 