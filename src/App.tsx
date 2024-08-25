import React, { useEffect, useState } from "react";
import { PiBellBold, PiDotsThreeBold, PiMagnifyingGlassBold, PiPencil, PiPlusBold, PiQuestionBold, PiTrash } from "react-icons/pi";
type Tasks = {
	title: string;
	description: string;
};
type Boards = {
	[key: string]: Tasks[];
};
function App() {
	const [boards, setBoards] = useState<Boards>(() => {
    const savedBoards = localStorage.getItem("boards");
    return savedBoards ? JSON.parse(savedBoards) : {
      todo: [
        {
          title: "Hero Section",
          description: "Create a design system for a hero section in 2 different variants. Create a simple presentation with these components.",
        },
      ],
      inprogress: [],
      completed: [],
    }
	});

	const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
	const [newTaskTitle, setNewTaskTitle] = useState<string>("");
	const [newTaskDescription, setNewTaskDescription] = useState<string>("");
	const [currentBoard, setCurrentBoard] = useState<string>("todo");
	const [dropdownTaskIndex, setDropdownTaskIndex] = useState<{ [key: string]: number | null }>({});

	// Editing Task
	const [editingTask, setEditingTask] = useState<{ board: string; index: number } | null>(null);
	const [editedTaskTitle, setEditedTaskTitle] = useState<string>("");
	const [editedTaskDescription, setEditedTaskDescription] = useState<string>("");
	const handleEditTask = (board: string, index: number) => {
		setEditingTask({ board, index });
		setEditedTaskTitle(boards[board][index].title);
		setEditedTaskDescription(boards[board][index].description);
	};
	const handleSaveEditTask = (board: string, index: number) => {
		const updatedBoard = boards[board].map((task, i) => (i === index ? { ...task, title: editedTaskTitle, description: editedTaskDescription } : task));

		setBoards({
			...boards,
			[board]: updatedBoard,
		});

		setEditingTask(null);
	};

	const handleCancelEditingTask = () => {
		setEditingTask(null);
		setDropdownTaskIndex({
			todo: null,
			inprogress: null,
			completed: null,
		});
	};
	// Editing End

	const handleAddTaskClick = (board: string) => {
		setIsAddingTask(true);
		setCurrentBoard(board);
	};

	const handleSaveTask = () => {
		setBoards({
			...boards,
			[currentBoard]: [...boards[currentBoard], { title: newTaskTitle, description: newTaskDescription }],
		});
		setIsAddingTask(false);
		setNewTaskDescription("");
		setNewTaskTitle("");
	};
	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				setIsAddingTask(false);
				setDropdownTaskIndex({
					todo: null,
					inprogress: null,
					completed: null,
				});
			}
		});
	}, []);
	const handleDropdown = (board: string, index: number) => {
		setDropdownTaskIndex((prevState) => ({
			...prevState,
			[board]: prevState[board] === index ? null : index,
		}));
	};
	const handleDeleteTask = (board: string, index: number) => {
		const updatedBoard = boards[board].filter((_, i) => i !== index);
		setBoards({
			...boards,
			[board]: updatedBoard,
		});
	};

	const handleOnDrag = (e: React.DragEvent, board: string, taskIndex: number) => {
		e.dataTransfer.setData("board", board);
		e.dataTransfer.setData("taskIndex", taskIndex.toString());
	};

	const handleOnDrop = (e: React.DragEvent, board: string) => {
		const sourceBoard = e.dataTransfer.getData("board");
		const taskIndex = parseInt(e.dataTransfer.getData("taskIndex"));

		if (isNaN(taskIndex)) {
			console.error("Invalid taskIndex:", taskIndex);
			return;
		}

		const movedTask = boards[sourceBoard][taskIndex];
		const updatedSourceBoard = boards[sourceBoard].filter((_, i) => i !== taskIndex);

		setBoards({
			...boards,
			[sourceBoard]: updatedSourceBoard,
			[board]: [...boards[board], movedTask],
		});
	};

	const handleOnDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

  useEffect(() => {
    localStorage.setItem("boards", JSON.stringify(boards));
  },[boards])
	return (
		<div className="App">
			<div className="headerWrapper">
				<div className="inputContainer">
					<PiMagnifyingGlassBold />
					<input type="text" placeholder="Search" />
				</div>
				<div className="rightside">
					<div className="notificationWrapper">
						<PiBellBold />
					</div>
					<div className="helpWrapper">
						<PiQuestionBold />
					</div>
					<div className="profileWrapper">
						<img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
					</div>
				</div>
			</div>
			{/* Header End */}
			<div className="pageTitle">
				<p>Board</p>
			</div>
			<div className="boardsWrapper">
				{Object.keys(boards).map((board, index) => (
					<div key={board} className={`board board${board}`} onDrop={(e) => handleOnDrop(e, board)} onDragOver={handleOnDragOver}>
						<div className="boardHeader">
							<div className="title">{board.charAt(0).toUpperCase() + board.slice(1)}</div>
							<div>
								<PiPlusBold onClick={() => handleAddTaskClick(board)} />
							</div>
						</div>

						{isAddingTask && currentBoard === board && (
							<div className="card">
								<div className="cardHeader">
									<div className="status">
										<span></span> {board.charAt(0).toUpperCase() + board.slice(1)}
									</div>
								</div>
								<div className="cardContent">
									<input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.currentTarget.value)} type="text" placeholder="Task Title" />
									<textarea value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.currentTarget.value)} rows={6} style={{ resize: "none" }} placeholder="Task Description" />
									<div className="buttonsWrapper">
										<button className="cancelBtn" onClick={() => setIsAddingTask(false)}>
											Cancel
										</button>
										<button className="saveBtn" onClick={handleSaveTask}>
											Save
										</button>
									</div>
								</div>
							</div>
						)}
						{boards[board].map((task, index) => (
							<div key={index} className="card" draggable onDragStart={(e) => handleOnDrag(e, board, index)}>
								{editingTask && editingTask.board === board && editingTask.index === index ? (
									<div className="cardContent">
										<input value={editedTaskTitle} onChange={(e) => setEditedTaskTitle(e.currentTarget.value)} type="text" />
										<textarea value={editedTaskDescription} onChange={(e) => setEditedTaskDescription(e.currentTarget.value)} rows={6} style={{ resize: "none" }} />
										<div className="buttonsWrapper">
											<button className="cancelBtn" onClick={handleCancelEditingTask}>
												Cancel
											</button>
											<button className="saveBtn" onClick={() => handleSaveEditTask(board, index)}>
												Save
											</button>
										</div>
									</div>
								) : (
									<>
										<div className="cardHeader">
											<div className="status">
												<span></span> {board.charAt(0).toUpperCase() + board.slice(1)}
											</div>
											<div className="editWrapper">
												<PiDotsThreeBold onClick={() => handleDropdown(board, index)} style={{ cursor: "pointer" }} />
												{dropdownTaskIndex[board] === index && (
													<div className="dropdownWrapper">
														<div className="option edit" onClick={() => handleEditTask(board, index)}>
															<PiPencil /> Edit
														</div>
														<div className="option delete" onClick={() => handleDeleteTask(board, index)}>
															<PiTrash /> Delete
														</div>
													</div>
												)}
											</div>
										</div>
										<div className="cardContent">
											<div className="cardTitle">{task.title}</div>
											<div className="cardDescription">{task.description}</div>
										</div>
									</>
								)}
							</div>
						))}
					</div>
				))}
			</div>
			<div className="footer">
				{new Date().getFullYear()} © All rights reserved.{" "}
				<a target="_blank" rel="noreferrer" href="https://keremunce.com">
					keremunce.com
				</a>
			</div>
		</div>
	);
}

export default App;
