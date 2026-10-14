# Updating the thermometer from a Google Sheet

The app's thermometer reads its total from a Google Sheet. Anyone with edit
access to the sheet can add money to the thermometer, with no app update.

## One-time setup

1. In Google Drive choose **New > File upload** and upload
   `fundraising-sheet-template.xlsx`, then open it and choose
   **File > Save as Google Sheets**. (Or make a new sheet with the layout below.)
2. Choose **File > Share > Publish to web**. Pick the **Thermometer** sheet and
   **Comma-separated values (.csv)**, then **Publish**.
3. Copy the link it gives you (it ends in `output=csv`) and paste it into
   `fundraisingSheetCsvUrl` in `src/constants/config.ts`.

Publishing to the web makes the sheet's numbers readable by anyone with the link,
so keep donor names out of it.

## Layout

| A               | B                                  | C      |
|-----------------|------------------------------------|--------|
| Goal            | 500000                             |        |
| Starting total  | 128420                             |        |
| Campaign        | Fuller Lake Inclusive Playground   |        |
|                 |                                    |        |
| Date            | Description                        | Amount |
| 2026-10-15      | Bake sale                          | 250    |

The app shows **Starting total + every Amount** below the `Amount` heading,
out of **Goal**. Keep the words in column A as they are. Google can take up to
about five minutes to publish a change.

If the sheet can't be reached, the app falls back to the website's thermometer,
then `fundraising.json`, then the figures in `config.fundraisingFallback`.
