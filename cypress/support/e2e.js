Cypress.Commands.add("loginByApi", (email, password) => {
  cy.request("POST", "/api/v1/session/login", { email, password });
});

Cypress.Commands.add("logoutByApi", () => {
  cy.request("POST", "/api/v1/session/logout", {});
});
