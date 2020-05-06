# Performance Tests

To run performance tests you should install Artillery.io

`npm i -g artillery`

After the installation you can run tests with the following command.

`artillery run TEST.yml`

---

### Phase Config Example

```
phases:
  - duration: 60
  arrivalRate: 3
```

The current phase config means: **3 requests every second during 60 seconds.**
