const admin = {
  email: "admin@example.cz",
  password: "admin",
};

const unique = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const createTeam = (name, description = "") =>
  cy
    .request("POST", "/api/v1/teams", { name, description })
    .its("body");

const createMember = (firstName, lastName, extras = {}) =>
  cy
    .request("POST", "/api/v1/members", {
      first_name: firstName,
      last_name: lastName,
      ...extras,
    })
    .its("body");

const findTeamByName = (name) =>
  cy.request("GET", "/api/v1/teams").then(({ body }) => {
    const team = body.items.find((item) => item.name === name);
    expect(team, `team "${name}" exists`).to.exist;
    return team;
  });

describe("Membership management", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginByApi(admin.email, admin.password);
  });

  it("col.1 - Create a new team", () => {
    const teamName = `ITS Team ${unique()}`;
    const teamNote = "Automaticky vytvoreny tym";

    createTeam(teamName, teamNote).then(() => {
      cy.visit("/teams");
      cy.contains(teamName).should("be.visible");
      cy.contains(teamNote).should("be.visible");
    });
  });

  it("col.2 - Create a new member", () => {
    const firstName = "John";
    const lastName = `Smith-${unique()}`;
    const email = `john.smith.${unique()}@example.com`;

    createMember(firstName, lastName, {
      primary_email: email,
      primary_phone: "+420123456789",
      birth_date: "2001-04-27",
      address: "123 Street, City",
      secondary_email: `john.smith.sec.${unique()}@example.com`,
      secondary_phone: "+420987654321",
      national_id: "010427/1234",
      facr_id: "123456789",
      state: "ACTIVE",
    }).then(() => {
      cy.visit("/members");
      cy.contains(firstName).should("be.visible");
      cy.contains(lastName).should("be.visible");
    });
  });

  it("col.3 - Assign member to team", () => {
    const firstName = "Assign";
    const lastName = `Member-${unique()}`;

    createMember(firstName, lastName).then((member) => {
      findTeamByName("Dorost").then((team) => {
        cy.request("POST", `/api/v1/members/${member.id}/team-memberships`, {
          team_id: team.id,
          valid_from: "2025-04-04",
          valid_to: "2026-08-08",
          note: "Any text",
        }).then(() => {
          cy.visit("/members");
          cy.contains(firstName).should("be.visible");
          cy.contains(lastName).should("be.visible");
          cy.contains("Dorost").should("be.visible");
        });
      });
    });
  });

  it("col.4 - Filter members by team", () => {
    const firstName = "Filter";
    const lastName = `Team-${unique()}`;

    createMember(firstName, lastName).then((member) => {
      findTeamByName("A muži").then((team) => {
        cy.request("POST", `/api/v1/members/${member.id}/team-memberships`, {
          team_id: team.id,
          valid_from: "2025-05-01",
          note: "Filter target",
        }).then(() => {
          cy.request("POST", "/api/v1/members/query", {
            page: 1,
            page_size: 20,
            sort: [],
            filters: [{ field: "teams", op: "eq", value: "A muži" }],
          }).then(({ body }) => {
            expect(body.items.length).to.be.greaterThan(0);
            const names = body.items.map((m) => `${m.first_name} ${m.last_name}`);
            expect(
              names.some((n) => n.includes(firstName) && n.includes(lastName))
            ).to.equal(true);
          });
        });
      });
    });
  });

  it("col.5 - Edit member information", () => {
    const firstName = "Edit";
    const originalLastName = `Original-${unique()}`;
    const updatedLastName = `Updated-${unique()}`;

    createMember(firstName, originalLastName).then((member) => {
      cy.request("PATCH", `/api/v1/members/${member.id}`, {
        first_name: firstName,
        last_name: updatedLastName,
        primary_email: member.primary_email ?? null,
        primary_phone: member.primary_phone ?? null,
        secondary_email: member.secondary_email ?? null,
        secondary_phone: member.secondary_phone ?? null,
        address: member.address ?? null,
        birth_date: member.birth_date ?? null,
        national_id: member.national_id ?? null,
        facr_id: member.facr_id ?? null,
        variable_symbol: member.variable_symbol ?? null,
        state: member.state ?? "ACTIVE",
      }).then(() => {
        cy.visit("/members");
        cy.contains(firstName).should("be.visible");
        cy.contains(updatedLastName).should("be.visible");
      });
    });
  });
});
