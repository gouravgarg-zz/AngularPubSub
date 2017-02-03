	angular.module('ToDoApp',[])

	.controller('FirstController', function($scope,$rootScope,  todoBusinessService,RESTServerAPI){

	//	following method is working fine with refresh call: but to update other controllers 
	// we need to use pub sub methods 
		//function refresh(){
		//	$scope.todoList=todoBusinessService.fetch();	
		//}
		//refresh();
			//this function is also working but  we are using rest server api so commenting the sme
		// $scope.$on('loadToDoList', function(){
		// 	$scope.todoList=todoBusinessService.fetch();
		// 	$rootScope.$broadcast('callSecondController')
		// })

		$scope.$on('loadToDoList', function($event,todoList){

			if(todoList){
				$rootScope.$broadcast('callSecondController',$scope.todoList);
			}else{
			RESTServerAPI.getAll()
			.then(function(response){
				$scope.todoList=response.data;
				$rootScope.$broadcast('callSecondController',$scope.todoList);	
			});
			}
		})

		$scope.$broadcast('loadToDoList');	

		//var uid=0;
		var originalValue ;
		$scope.createToDo = function($event){
				if($event.keyCode===13){
					var todo ={
						id:todoBusinessService.getUniqueId(),
						text: $scope.todoText,
						isCompleted:false
					}
					//$scope.todoList.push(todo);
					//todoBusinessService.create(todo)

					RESTServerAPI.post(todo)
					.then(function(response){
						if(response.status===201){
							$scope.todoList.push(todo);
							$scope.$broadcast('loadToDoList',$scope.todoList);
							$scope.todoText='';		
						}
					})
					.catch(function(error){
						console.log(error);
					})

					//refresh();
					// $scope.$broadcast('loadToDoList');	
					// console.log(localStorage);
					// $scope.todoText='';
				}

		}

		$scope.editEvent = function(todo){
					todo.isEditMode=true;
					originalValue =todo.text;
			}

			$scope.saveEvent = function(todo){
					todo.isEditMode=false;
					console.log(todo);
					delete todo.$$hashKey;
					//delete todo.isEditMode;
					//delete todo.originalValue;
					console.log(todo);
					todoBusinessService.update(todo );
			}
			$scope.cancelEvent = function(todo){
					todo.text=originalValue;
					todo.isEditMode=false;
			}

			$scope.deleteEvent = function(todo){
					if(todo.isCompleted){
						$scope.todoList.splice($scope.todoList.indexOf(todo),1);
					}else{
						if(confirm("Are you sure ?")){
							deleteEventConfirmation($scope.todoList.indexOf(todo));						
						}
					}
			}

			$scope.deleteEventIndex = function(todo,$index){
					$scope.todoList.splice($index,1);
			}

			function deleteEventConfirmation($index){
					$scope.todoList.splice($index,1);
			}

	})

	.controller('SecondController', function($scope, todoBusinessService,$rootScope){
			//this function is also working but  we are using rest server api so commenting the same, no required  todoBusinessService	
		
		// $rootScope.$on('callSecondController', function(){
		// 	$scope.todoList = todoBusinessService.fetch();	
		// });
		
		$rootScope.$on('callSecondController', function($event, todoList){
			$scope.todoList =todoList;	
		});
		
	})


	//this is factory like service . Factory is like scripting service is like OOP so this is only diff between them 
	.factory('todoBusinessService',function(dbService){
		return {
			//store data in local database
			create : function(todo){
				return dbService.set('todo-'+todo.id,todo);
			},


			update : function(todo){
				return dbService.update('todo-'+todo.id,todo);
			},

			fetch : function(){
				var todoList=[];
				var storageAll  = dbService.getLocalStorage();
				var avblKeys = Object.keys(storageAll);
				for (var i = 0; i < avblKeys.length ; i++) {
					if(avblKeys[i].indexOf('todo-')===0){
						//todoList.push(dbService.get(avblKeys[i]));	
						todoList.push(JSON.parse(storageAll[avblKeys[i]]))
					}
				}
				return todoList;
				
			},
			getUniqueId:function(){
				return Math.round(Math.random()*9999);
			}	
	}
	})

	//we need to use value instead of constant value can have function call but not in consstant
	//.constant('RESTAPIUrl', 'http://localhost:3000/todos');
	.value('RESTAPIUrl', 'http://localhost:3000/todos')

	.factory('RESTServerAPI', function(RESTAPIUrl,$http){
		return {

			getAll: function(){
				return  $http.get(RESTAPIUrl);
			},

			getOne: function(id){
				return  $http.get(RESTAPIUrl+'/'+id);
			},

			post: function(todo){
			return  $http.post(RESTAPIUrl,todo)	
			},

			put: function(id,todo){
				return  $http.put(RESTAPIUrl+'/'+id,todo)
			},

			delete: function(id){
				return  $http.delete(RESTAPIUrl+'/'+id)
			}
		}
	})

	//this is service which we can inject in any module by using directly name
	//localstorage is local storage max limit 5 mb but also depend on OS and 
	.service('dbService' , function(){
		this.get=function(key){
			return JSON.parse(localStorage.getItem(key));
		}

		this.getLocalStorage=function(){
			return localStorage ;
		}

		this.isSupported=function(){
			return !!localStorage;
		}

		this.set=function(key,value){
			localStorage.setItem(key, JSON.stringify(value));
		}

		this.update=function(key,value){
			localStorage.setItem(key, JSON.stringify(value));
		}

		this.remove=function(key){
			return localStorage.getItem(key);
		}
	})