require 'capybara'
require 'capybara/dsl'
require 'capybara/session'
require 'capybara/rspec'
require 'capybara/user_agent'
require 'rack'
require 'rack/jekyll'
require 'rack/test'
require 'rspec'


RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end
  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  Capybara.register_driver :selenium do |app|
    Capybara::Selenium::Driver.new(app, :browser => :chrome)
  end

	Capybara.app = Rack::Jekyll.new(force_build: true)
end
