CURRENT_BRANCH := `git branch --show-current`
TODAY := `date +%Y-%m-%d`
TIME := `date +%H:%M`

branch:
	echo $(CURRENT_BRANCH)

local.install:
	npm install

local.run:
	npm run dev

local.build:
	npm run build

local.preview:
	npm run preview

local.check:
	npm run astro check

local.clean:
	rm -rf dist node_modules/.astro

local.hero:
	node scripts/fetch-hero-images.mjs

content.writing:
	@read -p "Enter slug (e.g., my-new-post): " slug; \
	read -p "Enter title: " title; \
	read -p "Enter description: " desc; \
	read -p "Enter tags (comma-separated, e.g., typescript,astro): " tags; \
	filename="src/content/writing/$$slug.md"; \
	echo "---" > $$filename; \
	echo "title: \"$$title\"" >> $$filename; \
	echo "description: \"$$desc\"" >> $$filename; \
	echo "pubDate: $(TODAY)" >> $$filename; \
	echo "tags: [\"$${tags//,/\", \"}\"]" >> $$filename; \
	echo "---" >> $$filename; \
	echo "" >> $$filename; \
	echo "Write your content here..." >> $$filename; \
	echo "Created $$filename"; \
	$$EDITOR $$filename || open $$filename

content.note:
	@read -p "Enter slug (e.g., my-quick-note): " slug; \
	read -p "Enter title: " title; \
	read -p "Enter tags (comma-separated, e.g., git,productivity): " tags; \
	filename="src/content/notes/$$slug.md"; \
	echo "---" > $$filename; \
	echo "title: \"$$title\"" >> $$filename; \
	echo "pubDate: $(TODAY)" >> $$filename; \
	echo "tags: [\"$${tags//,/\", \"}\"]" >> $$filename; \
	echo "---" >> $$filename; \
	echo "" >> $$filename; \
	echo "Write your note here..." >> $$filename; \
	echo "Created $$filename"; \
	$$EDITOR $$filename || open $$filename

content.thought:
	@read -p "Enter slug (e.g., my-thought): " slug; \
	read -p "Enter tags (comma-separated, optional): " tags; \
	filename="src/content/thoughts/$$slug.md"; \
	echo "---" > $$filename; \
	echo "pubDate: $(TODAY)" >> $$filename; \
	echo "pubTime: \"$(TIME)\"" >> $$filename; \
	if [ -n "$$tags" ]; then echo "tags: [\"$${tags//,/\", \"}\"]" >> $$filename; fi; \
	echo "---" >> $$filename; \
	echo "" >> $$filename; \
	echo "Write your thought here..." >> $$filename; \
	echo "Created $$filename"; \
	$$EDITOR $$filename || open $$filename

production.build:
	npm run build

production.deploy:
	git push origin main

production.logs:
	gh run list --limit 5

production.status:
	gh run view
