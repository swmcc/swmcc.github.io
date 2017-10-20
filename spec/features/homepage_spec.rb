require 'spec_helper'

feature 'User goes to the index of this site' do
  scenario 'they see the homepage' do
    sleep(3)
    visit '/'

    expect(page.title).to eq 'The Only Stephen | Portfolio & Blog'
    # the tagline should be correct
    # should have two links to blogs posts
    # should have two links to work posts
    # should have the current year in the footer
  end
end

