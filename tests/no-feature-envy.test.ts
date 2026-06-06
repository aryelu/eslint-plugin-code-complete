import { ruleTester } from './config';
import rule from '../rules/no-feature-envy';

ruleTester.run('no-feature-envy', rule, {
  valid: [
    // Accesses own members more than the parameter
    `class OrderService {
      processOrder(order) {
        this.validate();
        this.log();
        this.save();
        const id = order.id;
        return id;
      }
    }`,

    // External accesses below default threshold of 3
    `class Formatter {
      format(data) {
        this.prepare();
        this.apply();
        this.flush();
        return data.value;
      }
    }`,

    // External accesses equal to this accesses (not strictly greater)
    `class Processor {
      process(item) {
        this.setup();
        this.run();
        item.validate();
        item.check();
        return this.result();
      }
    }`,

    // Constructor is ignored
    `class Builder {
      constructor(config) {
        this.url = config.url;
        this.port = config.port;
        this.host = config.host;
        this.timeout = config.timeout;
      }
    }`,

    // Standalone function (not inside a class) is ignored
    `function transform(data) {
      data.normalize();
      data.validate();
      data.clean();
      data.format();
      return data;
    }`,

    // Custom threshold — external accesses under the threshold
    {
      code: `class Handler {
        handle(request) {
          this.log();
          this.auth();
          request.parse();
          request.validate();
        }
      }`,
      options: [{ minExternalAccesses: 5 }]
    }
  ],

  invalid: [
    // Classic feature envy — method mostly works with the parameter
    {
      code: `class OrderService {
        calculateShipping(order) {
          const weight = order.weight;
          const dims = order.dimensions;
          const dest = order.destination;
          const priority = order.priority;
          return this.rateTable[priority];
        }
      }`,
      errors: [{
        messageId: 'featureEnvy',
        data: { method: 'calculateShipping', envied: 'order', externalCount: '4', thisCount: '1' }
      }]
    },

    // Zero this accesses — method does nothing with its own class
    {
      code: `class ReportService {
        formatUser(user) {
          const name = user.name;
          const email = user.email;
          const role = user.role;
          const dept = user.department;
          return \`\${name} <\${email}>\`;
        }
      }`,
      errors: [{
        messageId: 'featureEnvy',
        data: { method: 'formatUser', envied: 'user', externalCount: '4', thisCount: '0' }
      }]
    },

    // Custom lower threshold
    {
      code: `class Validator {
        validate(schema) {
          const type = schema.type;
          const rules = schema.rules;
          const min = schema.min;
          return this.isValid;
        }
      }`,
      options: [{ minExternalAccesses: 2 }],
      errors: [{
        messageId: 'featureEnvy',
        data: { method: 'validate', envied: 'schema', externalCount: '3', thisCount: '1' }
      }]
    },

    // Method expression (arrow function in class field) is not caught,
    // but regular method that envies a parameter is
    {
      code: `class PaymentProcessor {
        process(payment) {
          const amount = payment.amount;
          const currency = payment.currency;
          const method = payment.method;
          const token = payment.token;
          this.log(\`processing\`);
          return amount;
        }
      }`,
      errors: [{
        messageId: 'featureEnvy',
        data: { method: 'process', envied: 'payment', externalCount: '4', thisCount: '1' }
      }]
    }
  ]
});
