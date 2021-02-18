# react-pdf Better Examinations PDF Generation script

## Step 1

Edit `packages/examples/src/better_examinations/index.js` and edit the import statements at the top to import the correct submissions json file

## Step 2

run `yarn install` from the root directory first, then run `yarn be:generatepdf` to start creating the PDF documents.

There are a number or parameters that can be passed to the script:

- `start` - the submission to start from
- `end` - the submission to end on
- `--force` - pass this option to force the file generation (overwrite any files that exists with the same name)

## Example usage

`yarn be:generatepdf 75` - generate a PDF for submission 75

`yarn be:generatepdf 1 200` - generate PDFs for submission 1 to 200 (skipping any that already exist)

`yarn be:generatepdf 1 200 --force` - generate PDFs for submission 1 to 200 (overwrite any existing versions)
