const admin = {
  email: "admin@example.cz",
  password: "admin",
};

const unique = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

describe("Payment management", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginByApi(admin.email, admin.password);
  });

  it("col.10 - Create a required payment", () => {
    const note = `ITS required payment ${unique()}`;

    cy.request("POST", "/api/v1/transactions/manual", {
      amount: 2000,
      tx_date: "2026-06-30",
      manual_reason: "CASH",
      note,
    }).then(() => {
      cy.visit("/payments/operations");
      cy.contains(note).should("be.visible");
      cy.contains("2000").should("be.visible");
    });
  });
});
