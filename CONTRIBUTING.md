# Contributing

This is my personal portfolio, so I'm not looking for feature pull requests. Bug reports and fixes for typos, broken links or accessibility problems are welcome.

1. Open an issue first for anything bigger than a typo.
2. Branch from `main` with a prefix that matches the change, e.g. `fix/broken-blog-link`.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) without a version, e.g. `fix: correct the RankIT repo link`. The version is bumped once per release.
4. Run the same checks as CI before you push:

   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```

5. Update the README and the guides in `docs/` when your change affects them.

By contributing you agree that your work is released under the project's [license](LICENSE).
