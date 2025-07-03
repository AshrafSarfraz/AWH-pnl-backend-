                                                                      Add User

http://localhost:3000/user                                                     
                                                             
                                                             
                                                             
                                                             
                                                                   Company  Api's


  http://localhost:3000/company                   // Add new Company   (method Post)

{
  "name": "Test Company",
  "description": "Sample desc",
  "createdBy": "12345"
}

http://localhost:3000/company/by-user            //  Get by user Name (who create the company and how many company a user Create)  (method Post)

{ "createdBy": "12345"}


http://localhost:3000/company/<companyId>        // Update Company Name   (method Put)

{"name": "Updated Company Name"}

http://localhost:5000/api/companies/<companyId>  // Delete Company by Id   (method Delete)
 






                                                                   Category  Api's


http://localhost:3000/category    Add new category    (method Post)

{
  "name": "marketing",
  "type": "revenue",
  "companyId": "265fasstgasfgtt"
}


http://localhost:3000/category/COMPANY_ID_HERE       // Get Category By company Id ( just like Filter)   (method Get)

http://localhost:3000/category/Category_ID_HERE     // update category name and type     (Put Method)
{
  "name": "New Category Name",
  "type": "expense"
}

http://localhost:3000/category/Category_ID_HERE    // delete category by id         (Delete Method)






                                                                Sub Category


http://localhost:3000/subcategory                        // Add new Sub-category    (post method)

{ "name": "F1", "categoryId": "6863d989d275db24b3ebf681" }     


http://localhost:3000/subcategory/categoryId             // get by category id    (post method)

http://localhost:3000/subcategory/sub-categoryId        // update by sub-category id     (put-method)
{ "name": "Updated Name" }

http://localhost:3000/subcategory/sub-categoryId        //   delete by Sub-category Id    (Delete Method)







Entry Screen

post Api
http://localhost:3000/entry                         (Post Method)

{
  "createdBy": "Ashraf Sarfraz",
  "companyId": "Company 1",
  "type": "revenue",
  "categoryId": "category1",
  "subCategoryId": "subcategory2",
  "year": 2025,
  "entries": [
    {
      "month": 1,
      "budget": 5000,
      "actual": 4800
    }]}



delete Api 
http://localhost:3000/entry/delete                              (delete Method)

{
  "entryId": "68652d7459650b7e14e8ea61",       
  "entryItemId": "68652f1bf952c66028b81820"   
}


http://localhost:3000/entry/full/abc123                          (Total of All enteries under sub-category)               Get Method

http://localhost:3000/full/abc123?year=2024                      (Total of All enteries By Yearly under sub-category)     Get Method

http://localhost:3000/entry/category/cat1234/full                each Category Total (Having All sub-Category)            Get Method                
 
http://localhost:3000/entry/company/comp123/summary               Total Revenue and Expense and Net Profit                Get Method  

http://localhost:3000/entry/company/comp123/summary?year=2025       Total Revenue and Expense and Net Profit by year      Get Method


                             


 // total sum of Group means (manager having 2 companies) so total of both companies ( net profit, revenue, expense)

 http://localhost:3000/ceo/dashboard   