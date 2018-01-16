# 1. SRM Network Login

#v1
requires root, qpython, py-dependencies (requests, rsa, urllib3) and patience

#v2
~~requires root~~
requires termux (with Python, {requests, rsa}) _includes auto-install script_

>pip install -r requirements.txt

Login code by : [thewisenerd](https://github.com/thewisenerd/check.point.automaton)


# 2. SRM Timetable Generator

- Grab the following tables (in raw HTML format) from [academia.srmuniv.ac.in](https://academia.srmuniv.ac.in/) :
  ⬛ Academic Planner (for knowing the day order for the particular day)
  ⬛ Time Table (for knowing the various slots of the day order)
  ⬛ Courses Table (for knowing which courses correspond to the respective slots)

- [Convert the HTML table to CSV file](http://www.convertcsv.com/html-table-to-csv.htm).

- Store the CSV as a Google Sheet in a safe location in your Google Drive.

- Set up [Tasker](https://drive.google.com/open?id=1hjNnzKUqz0bxVbGnUtr1iO0Xt_kWAK84) and [SpreadsheetTaskerPlugin](https://drive.google.com/open?id=1465EYyBS2zDF3QZxhIpVdEmt_ymqXtEQ) on your Android.

- Configure the SpreadsheetTaskerPlugin for all the three Google Sheets.

- Ready to rock. Start by running Academic Planner through Tasker.
