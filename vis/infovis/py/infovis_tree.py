"""Python infovis/tree functionality."""

# py imports
import csv
import logging

# libs
import simplejson


class TableLoader(object):
  """Convert tabular data into a set of values suitable for Node creation."""

  def __init__(self, listOfLists, rootName="Root"):
    """Prepare data for input to tree.

    Args:
      listOfLists: List of arrays representing rows in a table
      rootName: Name to assign to root node
    """
    self.newDict = {}
    for entry in listOfLists:
      # each row
      try:
        value = float(entry[-1])
      except ValueError:
        value = None
      for i, name in enumerate(entry):
        if name not in self.newDict.keys():
          # if we're on second last, and last is a number
          if i == len(entry)-2 and value:
            # add the node with the value
            self.newDict[name] = (name, entry[i-1], name, value)
            # move on to next row
            break
          elif i>0:
            self.newDict[name] = (name, entry[i-1], name, None)
          # it should join to root
          else:
            self.newDict[name] = (name, rootName, name, None)

  def getRes(self):
    """Get generated result set."""
    return self.newDict.values()


class Node(object):
  """A node."""

  def __init__(self, thisid, thistitle, value=None):
    """Init node object.

    Args:
      thisid: An int/string/object identifying the root node
      thistitle: A title for the node
      value: A value to associate with the node
          TODO: value should be a dict really, not a straight value
    """
    self.id = thisid
    self.title = thistitle
    self.data = {}
    self.children = []
    if value is not None:
      self.data['value'] = int(value)
    else:
      self.data['value'] = value


class Tree(object):

  def __init__(self, rootId, rootTitle):
    """
    Init our tree.

    Args:
      rootId: See Node()
      rootTitle: See Node()
    """
    self.treeMap = {}
    self.root = Node(rootId, rootTitle)
    self.resultMap = {"id":self.root.id,
                      "name": self.root.title,
                      "data": self.root.data,
                      "children": []}
    self.treeMap[self.root.id] = self.root

  def addNode(self, element):
    """"Add a Node to the tree.

    Args:
      element: Array holding nodeId, parentId, titleOfNode, data
          See Node()
    """
    nodeId = element[0]
    parentId = element[1]
    title = element[2]
    try:
      value = element[3]
    except IndexError:
      value = None
    if not nodeId in self.treeMap:
      self.treeMap[nodeId] = Node(nodeId, title, value)
    else:
      self.treeMap[nodeId].id = nodeId
      self.treeMap[nodeId].title = title
      self.treeMap[nodeId].data['value'] = value
    if not parentId in self.treeMap:
      # this should be overwritten
      self.treeMap[parentId] = Node(parentId, parentId, value)
    self.treeMap[parentId].children.append(self.treeMap[nodeId])

  def addNodes(self, elsToAdd):
    """Add list of Nodes."""
    for element in elsToAdd:
      self.addNode(element)

  def buildMap(self, node=None, dictToPopulate=None,):
    """Build a structure of nested dicts representing tree for usage."""
    if node == None: node = self.root
    if dictToPopulate == None: dictToPopulate = self.resultMap
    for n in node.children:
      newDict = {"id":n.id,"name":n.title,"children":[], "data":{'$area': n.data['value'], '$dim': n.data['value']}}
      dictToPopulate["children"].append(newDict)
      if len(n.children) > 0:
        self.buildMap(n, newDict)

  def loadValues(self, node=None):
    """Function called recursively to aggregate values from leaf to root of tree.

    Finds nodes with values and aggregates to parent.

    Args:
      node: Node object to begin traversal at
    """
    if node == None: node = self.root
    # if they have children
    # child doesn't have values
    for childNode in node.children:
      if childNode.data['value'] == None:
        self.loadValues(childNode)
    node.data['value'] = 0
    for childNode in node.children:
      node.data['value']+=childNode.data['value']
    return

  def printMap(self, node=None, lvl=0):
    """Print out the tree structure to the terminal

    Args:
      node: Node object to begin traversal at
      lvl: Int representing level of traversal (used for printing)
    """
    if node == None:
      node = self.root
      print node.title + ": " + str(node.data['value'])
    for n in node.children:
      print '-----------' * (lvl+1) + n.title + ": " + str(n.data['value'])
      if len(n.children) > 0:
        self.printMap(n, lvl+1)


  def getMap(self):
    """Get the result map when built.

    Returns
      Ductionary object.
    """
    return self.resultMap
