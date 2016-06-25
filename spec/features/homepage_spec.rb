require 'spec_helper'

feature 'Visitor comes to the site' do

  let(:title) { 'The Only Stephen | Portfolio & Blog' }
  before :each do
    visit "/index.html"
  end

  scenario 'and they look at the front page' do
    expect(page).to have_selector('title', text: title, visible: false)
    expect(page).to have_selector(:css, 'a[href="/"]')
    expect(page).to have_selector(:css, 'a[href="/work"]')
    expect(page).to have_selector(:css, 'a[href="/blog"]')
    expect(page).to have_selector(:css, 'a[href="/cv.pdf"]')
  end

end
