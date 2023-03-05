// test user without login can search and read a post
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#title").type("asdfgh");
    cy.get("#search").click();
    cy.get(".portrait-panel").click();
    cy.get("#author").should("have.text", "qwerty");
  });
});
// Passed
