// test whether can page samller than 1, and can it have right alert message
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/");
    cy.on("window:alert", (message) => {
      expect(message).to.contain("You are already on the first page");
    });
    cy.get("#prev").click();
  });
});
// Passed
