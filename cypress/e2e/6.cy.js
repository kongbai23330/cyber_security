// test user without login cannot create new post
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#title").type("asdfgh");
    cy.get("#newpost").click();
    cy.on("window:alert", (message) => {
      expect(message).to.contain("Login is required");
    });
  });
});
// Passed
