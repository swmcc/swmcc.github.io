FROM jekyll/jekyll:3.5
MAINTAINER Stephen McCullough <stephen.mccullough@gmail.com> 

EXPOSE 4000

COPY Gemfile* ./

# install language-level dependencies inside the container
RUN gem install bundler
RUN bundle install

COPY . .

CMD ["jekyll", "serve"]
