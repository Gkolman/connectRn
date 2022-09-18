const request = require("supertest")
const baseURL = "http://localhost:3000"

describe("POST /user/data", () => {
  const userData = [
    {   
      "user_id": 1,
      "name": "Joe Smith",
      "date_of_birth": "1983-05-12",
      "created_on": 1642612034
    }
  ]
  const result =  [
    {
      "user_id": 1,
      "name": "Joe Smith",
      "date_of_birth": "thursday",
      "created_on": "2022-01-19 12:07:14-05:00"  
    }
  ]
  it("gets the day of the week of the users birthday and parses the epoch time", async () => {
    const response = await request(baseURL).post("/user/data").send(userData);
    expect(response.body).toEqual(result);
  });
});

describe("GET /users", () => {
  it("returns a list of users in the database", async () => {
    const response = await request(baseURL).get("/users");
    expect(response.body.length).toBeGreaterThan(0);
  });
});

describe("POST /users", () => {
  const userData = {   
      firstName: "Gage",
      lastName: "Guzman",
      city: "Livermore",
      zipCode: "94550"
    }
  it("creates a new user", async () => {
    const response = await request(baseURL).post("/users").send(userData);
    expect(response.status).toBe(200);
  });
});

describe("Delete /users/:id", () => {
  it("creates a new user", async () => {
    const response = await request(baseURL).delete("/users/5");
    expect(response.status).toBe(200);
  });
});

describe("GET /users/:id", () => {
  it("creates the requested user", async () => {
    const response = await request(baseURL).get("/users/2");
    expect(response.body).toEqual({});
  });
});

describe("POST /users/:id/password", () => {
  const newPassword = {'password': 'newPassword'}
  it("creates a new password for the specified user", async () => {
    const response = await request(baseURL).post("/users/2/password").send(newPassword);
    expect(response.status).toBe(200);
  });
});

describe("GET /passwords", () => {
  it("creates a new password for the specified user", async () => {
    const response = await request(baseURL).get("/passwords");
    expect(response.body.length).toBeGreaterThan(0);
  });
});

describe("GET /passwords/active", () => {
  it("creates a new password for the specified user", async () => {
    const response = await request(baseURL).get("/passwords/active");
    expect(response.body.length).toBeGreaterThan(0);
  });
});
