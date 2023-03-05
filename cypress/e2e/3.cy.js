// test can user visit a post without login, and it render right content
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#1678033247718").click();
    cy.get('#author').should('have.text', 'qwerty');
  });
});
// Passed
