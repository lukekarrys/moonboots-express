test:
		@node node_modules/lab/bin/lab -t 100 -l
test-no-cov:
		@node node_modules/lab/bin/lab
test-cov-html:
		@node node_modules/lab/bin/lab -r html -o coverage.html

.PHONY: test test-no-cov test-cov-html