#!/usr/bin/python

# python imports
import csv
import datetime
import StringIO
import logging

# requires the gviz_api
import gviz_api


class GvizFromCsv(object):
  """Convert CSV to Gviz gviz_api.DataTable objects.

  Attempts to take care of type conversions etc.
  """

  def __init__(self, csvFile, dateTimeFormat="%Y-%m-%d",
               headerLabelMap=None, log=True):
    """Init the helper.

    Args:
      csvFile: Accepts either a file object, or csv string
      dateTimeFormat: Optional string to identify date columns in csv.
          Standard formats are used. Example: "%Y-%m-%d"
      headerLabelMap:

    """
    self.dtHeaders = {}
    self.dateTimeFormat = dateTimeFormat
    self.headerLabelMap = headerLabelMap
    self.log = log
    # figure out how to interpret our csv data
    # this should handle cases where the csv data is loaded
    # in via a file, or as a string.
    if isinstance(csvFile, str):
      self.fileObj = StringIO.StringIO(csvFile)
    else:
      self.fileObj = csvFile
    self.csvDict = csv.DictReader(self.fileObj)
    self.ParseHeaders()
    if self.log:
      logging.info([self.dtHeaders, 'table headers'])

  def _IsNumber(self, st):
    """Test if variable can be converted to number.

    Args:
      st: String to test

    Returns:
      Boolean: true if string can be converted to a number
    """
    try:
        float(st)
        return True
    except ValueError:
        return False

  def _IsDate(self, st):
    """Test if variable can be converted to date.

    Requires self.dateTimeFormat to be set.

    Args:
      st: String to test

    Returns:
      Boolean: true if string can be converted to date
    """
    try:
      datetime.datetime.strptime(st, self.dateTimeFormat)
      return True
    except ValueError:
      return False

  def GetHeaders(self):
    return self.dtHeaders.keys()

  def ParseHeaders(self):
    """Attempts to figure out column types for the DataTable.

    This method performs a series of tests on the first row of csv data,
    in order to identify the data types present. self.dtHeaders will be
    populated as this runs.
    """
    for k, v in self.csvDict.next().items():
      if self._IsNumber(v):
        if self.headerLabelMap:
          try:
            self.dtHeaders[k] = ('number', self.headerLabelMap[k])
          except KeyError:
            self.dtHeaders[k] = ('number', k)
        else: self.dtHeaders[k] = ('number', k)
      elif self._IsDate(v):
        if self.headerLabelMap:
          try:
            self.dtHeaders[k] = ('date', self.headerLabelMap[k])
          except KeyError:
            self.dtHeaders[k] = ('date', k)
        else: self.dtHeaders[k] = ('date', k)
      else:
        if self.headerLabelMap:
          try:
            self.dtHeaders[k] = ('string', self.headerLabelMap[k])
          except KeyError:
            self.dtHeaders[k] = ('string', k)
        else: self.dtHeaders[k] = ('string', k)

  def fixRowTypesAndAppendToDataTable(self):
    """Converts row entries from string to correct type, and adds to table.

    This method will use self.dtHeaders to determine column types, then will
    ensure that each relevant entry in our csv is converted to this type.
    Once type conversion has been completed the row will be added to our
    DataTable.
    """
    update_to_numbers = []
    update_to_dates = []
    for k,v in self.dtHeaders.items():
      if v[0] == 'number':
        update_to_numbers.append(k)
      if v[0] == 'date':
        update_to_dates.append(k)
    self.fileObj.seek(0)
    self.csvDict.next()
    count = 0
    for i in self.csvDict:
      if self.log and count<2:
        logging.info([i.values(), 'sample row'])
        count+=1
      for col in update_to_numbers:
        i[col] = float(i[col])
      for col in update_to_dates:
        i[col] = datetime.datetime.strptime(i[col], self.dateTimeFormat)
      self.dt.AppendData([i])

  def GetDataTable(self):
    """Generate and return the data table

    Returns:
      gviz_api.DataTable object
    """
    self.dt = gviz_api.DataTable(self.dtHeaders)
    self.fixRowTypesAndAppendToDataTable()
    return self.dt
