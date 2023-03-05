// test user cannot delete a post created by another user
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/sign");
    cy.get("#username").type("asdfgh");
    cy.get("#password").type("Qwerty123");
    cy.get("#signin").click();
    cy.on("window:alert", (message) => {
      expect(message).to.contain("Login Successful");
      cy.get("#title").type("qwerty");
      cy.get("#search").click();
      cy.get(".portrait-panel").click();
      cy.on("window:alert", (message) => {
        expect(message).to.contain("You have no permission to do so");
      });
      cy.get("#remove").click();
    });
  });
});
// Passed
