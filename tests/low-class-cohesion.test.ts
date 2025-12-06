/**
 * @fileoverview Tests for low-class-cohesion rule
 * @author eslint-plugin-code-complete
 */

import { ruleTester } from './config';
import rule from '../rules/low-class-cohesion';

ruleTester.run('low-class-cohesion', rule, {
  valid: [
    // Short class - below minimum length
    `
    class ShortClass {
      constructor() {
        this.value = 0;
      }
      
      getValue() {
        return this.value;
      }
    }
    `,
    
    // Class with high cohesion - all methods share fields
    `
    class CohesiveUserService {
      constructor() {
        this.users = [];
        this.activeUsers = [];
      }
      
      addUser(user) {
        this.users.push(user);
        if (user.active) {
          this.activeUsers.push(user);
        }
      }
      
      removeUser(userId) {
        this.users = this.users.filter(u => u.id !== userId);
        this.activeUsers = this.activeUsers.filter(u => u.id !== userId);
      }
      
      getActiveCount() {
        return this.activeUsers.length;
      }
      
      getTotalCount() {
        return this.users.length;
      }
    }
    `,
    
    // Class with chained cohesion (A->B, B->C means all connected)
    `
    class ChainCohesionClass {
      constructor() {
        this.dataA = [];
        this.dataB = [];
        this.dataC = [];
      }
      
      // Method 1: Uses dataA and dataB
      processA() {
        this.dataA.forEach(item => {
          this.dataB.push(item * 2);
        });
      }
      
      // Method 2: Uses dataB and dataC
      processB() {
        this.dataB.forEach(item => {
          this.dataC.push(item + 1);
        });
      }
      
      // Method 3: Uses dataC
      processC() {
        return this.dataC.reduce((a, b) => a + b, 0);
      }
    }
    `,
    
    // Class where methods call each other
    `
    class MethodCallingClass {
      constructor() {
        this.value = 0;
        this.result = 0;
      }
      
      calculate() {
        this.value = 10;
        this.transform();
      }
      
      transform() {
        this.result = this.value * 2;
        this.finalize();
      }
      
      finalize() {
        console.log(this.result);
      }
    }
    `,
    
    // Class with custom minClassLength option
    {
      code: `
      class CustomThresholdClass {
        constructor() {
          this.userList = [];
          this.productList = [];
        }
        
        addUser(user) {
          this.userList.push(user);
        }
        
        addProduct(product) {
          this.productList.push(product);
        }
      }
      `,
      options: [{ minClassLength: 20 }]
    }
  ],

  invalid: [
    // Class with completely separate responsibilities
    {
      code: `
      class MultiResponsibilityClass {
        constructor() {
          this.users = [];
          this.logs = [];
          this.config = {};
        }
        
        // User management - uses only this.users
        addUser(user) {
          this.users.push(user);
        }
        
        removeUser(userId) {
          this.users = this.users.filter(u => u.id !== userId);
        }
        
        // Log management - uses only this.logs
        addLog(log) {
          this.logs.push(log);
        }
        
        clearLogs() {
          this.logs = [];
        }
        
        // Config management - uses only this.config
        updateConfig(key, value) {
          this.config[key] = value;
        }
        
        getConfig(key) {
          return this.config[key];
        }
      }
      `,
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    },
    
    // God class example - multiple unrelated functionalities
    {
      code: `
      class UserManager {
        constructor() {
          this.users = [];
          this.emailConfig = {};
          this.reportData = [];
        }
        
        // User CRUD operations
        createUser(userData) {
          const user = { id: Date.now(), ...userData };
          this.users.push(user);
          return user;
        }
        
        deleteUser(userId) {
          this.users = this.users.filter(u => u.id !== userId);
        }
        
        findUser(userId) {
          return this.users.find(u => u.id === userId);
        }
        
        // Email functionality (unrelated to user storage)
        configureEmail(smtpServer, port) {
          this.emailConfig = { smtpServer, port };
        }
        
        sendEmail(to, subject, body) {
          console.log('Sending email via', this.emailConfig.smtpServer);
        }
        
        // Report generation (unrelated to both)
        generateReport(type) {
          this.reportData.push({ type, timestamp: Date.now() });
        }
        
        exportReports() {
          return this.reportData.map(r => JSON.stringify(r));
        }
      }
      `,
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    },
    
    // Two separate concerns in one class
    {
      code: `
      class DataProcessor {
        constructor() {
          this.rawData = [];
          this.processedData = [];
          this.cacheKeys = new Set();
          this.cacheValues = new Map();
        }
        
        // Data processing concern
        addRawData(data) {
          this.rawData.push(data);
        }
        
        processData() {
          this.processedData = this.rawData.map(d => d * 2);
        }
        
        getProcessedData() {
          return this.processedData;
        }
        
        // Caching concern (completely separate)
        setCache(key, value) {
          this.cacheKeys.add(key);
          this.cacheValues.set(key, value);
        }
        
        getCache(key) {
          return this.cacheValues.get(key);
        }
        
        clearCache() {
          this.cacheKeys.clear();
          this.cacheValues.clear();
        }
      }
      `,
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    },
    
    // Class with custom threshold
    {
      code: `
      class SmallMultiConcernClass {
        constructor() {
          this.listA = [];
          this.listB = [];
        }
        
        addToA(item) {
          this.listA.push(item);
        }
        
        addToB(item) {
          this.listB.push(item);
        }
        
        clearA() {
          this.listA = [];
        }
        
        clearB() {
          this.listB = [];
        }
      }
      `,
      options: [{ minClassLength: 5 }],
      errors: [
        {
          messageId: 'lowCohesion'
        }
      ]
    }
  ]
});

