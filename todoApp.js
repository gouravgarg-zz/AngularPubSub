angular.module('ToDoApp',[])

.controller('FirstController', function($scope,$rootScope,  todoBusinessService){

//	following method is working fine with refresh call: but to update other controllers 
// we need to use pub sub methods 
	//function refresh(){
	//	$scope.todoList=todoBusinessService.fetch();	
	//}
	//refresh();
		
	$scope.$on('loadToDoList', function(){
		$scope.todoList=todoBusinessService.fetch();
		$rootScope.$broadcast('callSecondController')
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
				todoBusinessService.create(todo)
				//refresh();
				$scope.$broadcast('loadToDoList');	
				console.log(localStorage);
				$scope.todoText='';
			}

	}

	$scope.editEvent = function(todo){
				todo.isEditMode=true;
				 originalValue =todo.text;
		}

		$scope.saveEvent = function(todo){
				todo.isEditMode=false;
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
	$rootScope.$on('callSecondController', function(){
		$scope.todoList = todoBusinessService.fetch();	
	});
	
})


//this is factory like service . Factory is like scripting service is like OOP so this is only diff between them 
.factory('todoBusinessService',function(dbService){
	return {
		//store data in local database
		create : function(todo){
			return dbService.set('todo-'+todo.id,todo);
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

	this.update=function(key){
		localStorage.setItem(key, JSON.stringify(value));
	}

	this.remove=function(key){
		return localStorage.getItem(key);
	}
})