import HomePage from '../pageObjects/HomePage'
import UpdatesPage from '../pageObjects/UpdatesPage'
import WomensPage from '../pageObjects/WomensPage'
import CartPage from '../pageObjects/CartPage'
import CheckOutPage from '../pageObjects/CheckOutPage'
import PaymentsPage from '../pageObjects/PaymentsPage'

describe('Ecommerce Shopping', function () {
  before(function () {
    cy.fixture('example').then(function (data) {
      this.data = data
    })
  })
  after(() => {
    cy.log('All tests are done. ')
    Cypress.runner.stop()
  })
  it('Verify Home Page Functionality', function () {
    let itemPrices = []
    const homePage = new HomePage()
    const updatesPage = new UpdatesPage()
    const womensPage = new WomensPage()
    const cartPage = new CartPage()
    const checkoutPage = new CheckOutPage()
    const paymentsPage = new PaymentsPage()

    cy.visit(Cypress.env('url'))
    cy.url().should('eq', 'https://magento.softwaretestingboard.com/')
    homePage.get_logo().should('exist')
    cy.wait(1000)
    homePage
      .get_title()
      .should('be.visible')
      .and(($el) => {
        expect($el.text().trim()).to.equal('New Luma Yoga Collection')
      })

    homePage.get_mainTitle().then(($el) => {
      cy.log($el.text())
      expect($el.text().trim()).to.include('Get fit and')
    })

    homePage.navItems.forEach((item) => {
      cy.get(item.selector).should('be.visible').and('contain.text', item.text)

      cy.get(item.selector).click()
      switch (item.text) {
        case "What's New":
          cy.url().should('include', '/what-is-new.html')
          break
        case 'Women':
          cy.url().should('include', '/women.html')
          break
        case 'Men':
          cy.url().should('include', '/men.html')
          break
        case 'Gear':
          cy.url().should('include', '/gear.html')
          break
        case 'Training':
          cy.url().should('include', '/training.html')
          break
        case 'Sale':
          cy.url().should('include', '/sale.html')
          break
        default:
          throw new Error(`Unknown nav item text: ${item.text}`)
      }
    })
    homePage.get_Footer().should('exist')
    homePage.get_whatsNew().click()
    cy.url().should('include', 'what-is-new')
    updatesPage
      .get_newCollection_sideHeading()
      .should('have.text', 'New Luma Yoga Collection')
    updatesPage.get_newCollection_title().contains('The very latest yoga')
    cy.visit(Cypress.env('url'))
    homePage.get_womens().click()
    cy.url().should('include', 'women')
    womensPage.get_search().type('tee')
    womensPage
      .get_searchOptions()
      .should('be.visible')
      .each(($el) => {
        if ($el.text().trim() === 'tees and tops') {
          cy.wrap($el).click()
        }
      })
    cy.url().should('match', /\?q=\+tees\+and\+tops/)
    womensPage
      .get_searchTitle()
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.match(/Search results for:\s*'tees and tops'/i)
      })
    this.data.products.forEach((prod) => {
      cy.selectProduct(prod)
    })
    womensPage.get_cartButton().click()
    womensPage.get_proceedToCheckOut().click()
    cy.wait(1000)
    cy.url().should('include', 'checkout')
    checkoutPage.get_page_title().should('have.text', 'Shipping Address')
    checkoutPage.get_emailInput().type(this.data.purchaser_details.email)
    checkoutPage
      .get_firstNameInput()
      .type(this.data.purchaser_details.first_name)
    checkoutPage.get_lastNameInput().type(this.data.purchaser_details.last_name)
    checkoutPage
      .get_companyNameInput()
      .type(this.data.purchaser_details.company)
    checkoutPage.get_addressInput().type(this.data.purchaser_details.address)
    checkoutPage.get_cityInput().type(this.data.purchaser_details.city)
    checkoutPage.get_regionSelect().select(this.data.purchaser_details.region)
    checkoutPage.get_zipCode().type(this.data.purchaser_details.zip_code)
    checkoutPage.get_countrySelect().select(this.data.purchaser_details.country)
    checkoutPage.get_phoneInput().type(this.data.purchaser_details.phone)
    cy.wait(1000)
    checkoutPage.get_orderSummary_title().should('have.text', 'Order Summary')
    checkoutPage.get_orderSummary().click()
    this.data.products.forEach((product, index) => {
      checkoutPage
        .get_cartItems()
        .eq(index)
        .within(() => {
          checkoutPage.get_productItemName().should('have.text', product.name)
          checkoutPage.get_toggleElem().click({ force: true })
          checkoutPage
            .get_productSize()
            .contains('Size')
            .next()
            .should('have.text', product.size)
          checkoutPage
            .get_productColor()
            .contains('Color')
            .next()
            .should('have.text', product.color)
        })
    })
    // checkoutPage.get_shippingCost().check()

    cy.get(checkoutPage.shipping_method_Tbl, { timeout: 10000 }).should(
      'be.visible'
    )
    cy.contains('tr', 'Table Rate').within(() => {
      cy.get('input[type="radio"]').check({ force: true })
    })
    cy.contains('tr', 'Table Rate').within(() => {
      cy.get('input[type="radio"]').should('be.checked')
    })
    checkoutPage.get_continueBtn().click()
    cy.url().should('include', 'payment')
    paymentsPage
      .get_cartItemPrice()
      .each(($el) => {
        const priceText = $el.text().trim().replace('$', '')
        itemPrices.push(parseFloat(priceText))
      })
      .then(() => {
        const expectedItemsTotal = itemPrices.reduce(
          (acc, price) => acc + price,
          0
        )

        paymentsPage.get_shippingAmount().then(($shipping) => {
          const shippingText = $shipping.text().trim().replace('$', '')
          const shippingCost = parseFloat(shippingText)
          const expectedTotalWithShipping = expectedItemsTotal + shippingCost
          paymentsPage.get_totalPrice().then(($total) => {
            const totalText = $total.text().trim().replace('$', '')
            const actualTotal = parseFloat(totalText)
            expect(actualTotal).to.eq(expectedTotalWithShipping)
          })
        })
      })

    paymentsPage.get_shippingInfo().should('be.visible')
    paymentsPage.get_shippingInfo().should('contain.text', 'Table Rate')

    paymentsPage
      .get_paymenentsPage_title()
      .should('have.text', 'Payment Method')
    paymentsPage
      .get_billingDetails()
      .should('contain', this.data.purchaser_details.first_name)
    paymentsPage
      .get_billingDetails()
      .should('contain', this.data.purchaser_details.address)
    paymentsPage.get_cartSection_title('have.text', 'Order Summary')
    paymentsPage.get_PlaceOrderBtn().click()
    paymentsPage.get_PaymentSuccess_msg(
      'have.text',
      'Thank you for your purchase!'
    )
    paymentsPage
      .get_emailAddress()
      .should('have.text', this.data.purchaser_details.email)
  })
})
