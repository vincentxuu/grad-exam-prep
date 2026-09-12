#include <iostream>
#include <new>
#include <sstream>
#include <string>
using namespace std;

class TreeNode {
public:
  TreeNode() = default;
private:
  int employeeID;
  string employeeName;
  int age;
  TreeNode *leftChildPtr;
  TreeNode *rightChildPtr;
  friend class BinarySearchTree;
};

class BinarySearchTree {
public:
  BinarySearchTree() : rootPtr(NULL) {}
  int InsertNewEmployee(int newID, string newName, int newAge);
  void ListAllEmployee();
protected:
  void inorder(TreeNode *treePtr);
private:
  TreeNode *rootPtr;
};

int BinarySearchTree::InsertNewEmployee(int newID, string newName, int newAge) {
  TreeNode *node = new (nothrow) TreeNode;
  if (node == NULL) return 0;
  node->employeeID = newID;
  node->employeeName = newName;
  node->age = newAge;
  node->leftChildPtr = node->rightChildPtr = NULL;
  if (rootPtr == NULL) { rootPtr = node; return 1; }
  TreeNode *current = rootPtr;
  TreeNode *parent = NULL;
  while (current != NULL) {
    parent = current;
    current = (newID < current->employeeID) ? current->leftChildPtr : current->rightChildPtr;
  }
  if (newID < parent->employeeID) parent->leftChildPtr = node;
  else parent->rightChildPtr = node;
  return 1;
}

void BinarySearchTree::ListAllEmployee() { inorder(rootPtr); }

void BinarySearchTree::inorder(TreeNode *treePtr) {
  if (treePtr == NULL) return;
  inorder(treePtr->leftChildPtr);
  cout << treePtr->employeeID << " " << treePtr->employeeName << " " << treePtr->age << endl;
  inorder(treePtr->rightChildPtr);
}

int main() {
  BinarySearchTree tree;
  tree.InsertNewEmployee(50, "Lin", 40);
  tree.InsertNewEmployee(20, "Chen", 28);
  tree.InsertNewEmployee(70, "Wang", 35);
  tree.InsertNewEmployee(10, "Wu", 25);
  tree.InsertNewEmployee(30, "Hsu", 31);
  tree.ListAllEmployee();
}
