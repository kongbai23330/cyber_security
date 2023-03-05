// test can user logout
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/sign");
    cy.get("#username").type("asdfgh");
    cy.get("#password").type("Qwerty123");
    cy.get("#signin").click();
    cy.get("#signout").click();
  });
});
// Passed
