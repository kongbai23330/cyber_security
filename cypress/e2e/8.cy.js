// test can user create post after login
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/sign");
    cy.get("#username").type("asdfgh");
    cy.get("#password").type("Qwerty123");
    cy.get("#signin").click();
    cy.get('#title').type('xxxxxx');
    cy.get('#newpost').click()
    cy.get('#first').type('123456')
    cy.get('#submit').click()
    cy.get("#title").type("xxxxxx");
    cy.get("#search").click();
    cy.get(".portrait-panel").click();
    cy.get("#author").should("have.text", "asdfgh");
  });
});
// Passed
