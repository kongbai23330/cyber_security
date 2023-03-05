// test admin can delete any post regardless of author
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/sign");
    cy.get("#username").type("admin");
    cy.get("#password").type("getunlimitedaccess");
    cy.get("#signin").click();
    cy.get("#title").type("qwerty");
    cy.get("#search").click();
    cy.get(".portrait-panel").click();
    cy.wait(1000);
    cy.get("#remove").click();
    cy.get("#title").type("qwerty");
    cy.get("#search").click();
    cy.get('#no-res').should('have.text', 'No matched result');
  });
});
// Passed
