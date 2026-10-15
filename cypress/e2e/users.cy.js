const admin = {
  email: "admin@example.cz",
  password: "admin",
};

const unique = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const createMember = (firstName, lastName, extras = {}) =>
  cy
    .request("POST", "/api/v1/members", {
      first_name: firstName,
      last_name: lastName,
      ...extras,
    })
    .its("body");

const createUser = (email, password, rightNames = []) =>
  cy
    .request("POST", "/api/v1/users", {
      email,
      password,
      right_names: rightNames,
    })
    .its("body");

const findUserByEmail = (email) =>
  cy.request("GET", "/api/v1/users").then(({ body }) => {
    const user = body.items.find((item) => item.email === email);
    expect(user, `user "${email}" exists`).to.exist;
    return user;
  });

describe("User management", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginByApi(admin.email, admin.password);
  });

  it("col.6 - Create a new user", () => {
    const email = `user.${unique()}@test.com`;
    const password = "password123";

    createUser(email, password, ["PLAYER"]).then(() => {
      cy.visit("/users");
      cy.contains(email).should("be.visible");
    });
  });

  it("col.7 - Assign user to member", () => {
    const email = `link.${unique()}@test.com`;
    const password = "password123";
    const firstName = "John";
    const lastName = `Link-${unique()}`;

    createMember(firstName, lastName).then((member) => {
      createUser(email, password, ["PLAYER"]).then(() => {
        findUserByEmail(email).then((user) => {
          cy.request("POST", `/api/v1/users/${user.id}/acting-roles`, {
            member_id: member.id,
            role_type: "MEMBER_SELF",
            is_default: true,
          }).then(() => {
            cy.visit("/users");
            cy.contains(email).should("be.visible");
            cy.contains(firstName).should("be.visible");
            cy.contains(lastName).should("be.visible");
          });
        });
      });
    });
  });

  it("col.8 - Change user role", () => {
    const email = `role.${unique()}@test.com`;
    const password = "password123";

    createUser(email, password, ["PLAYER"]).then(() => {
      findUserByEmail(email).then((user) => {
        cy.request("PATCH", `/api/v1/users/${user.id}`, {
          email,
          password,
          right_names: ["TRAINER"],
          status: "ACTIVE",
        }).then(() => {
          cy.visit("/users");
          cy.contains(email).should("be.visible");
          cy.contains(/trainer|tren[ée]r/i).should("be.visible");
        });
      });
    });
  });

  it("col.9 - User without permission cannot access user management", () => {
    const email = `regular.${unique()}@test.com`;
    const password = "password123";

    createUser(email, password, ["MEMBER"]).then(() => {
      cy.logoutByApi();
      cy.loginByApi(email, password);
      cy.visit("/");
      cy.get('a[href="/users"]').should("not.exist");
      cy.request({
        method: "GET",
        url: "/api/v1/users",
        failOnStatusCode: false,
      })
        .its("status")
        .should("be.oneOf", [401, 403]);
    });
  });
});
