package fullstackbackend.controller;

import fullstackbackend.model.Appointment;
import fullstackbackend.model.Document;
import fullstackbackend.model.Message;
import fullstackbackend.model.Task;
import fullstackbackend.service.AppointmentService;
import fullstackbackend.service.DocumentService;
import fullstackbackend.service.MessageService;
import fullstackbackend.service.TaskService;
import fullstackbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/employee")
public class EmployeeController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private MessageService messageService;

    // Message management
    @GetMapping("/messages/{employeeId}")
    public Map<String, List<Message>> getEmployeeMessages(@PathVariable Long employeeId) {
        return messageService.getUserMessages(employeeId);
    }

    @PostMapping("/messages")
    public Message sendMessage(@RequestBody Message message,
                               @RequestParam Long senderId,
                               @RequestParam Long recipientId) {
        return messageService.sendMessage(message, senderId, recipientId);
    }

    @PostMapping("/messages/{id}/read")
    public Message markMessageAsRead(@PathVariable Long id) {
        return messageService.markMessageAsRead(id);
    }

    @DeleteMapping("/messages/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
    }

    // Task management
    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task,
                           @RequestParam Long createdById,
                           @RequestParam Long assignedToId) {
        return taskService.createTask(task, createdById, assignedToId);
    }

    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/tasks/assigned/{userId}")
    public List<Task> getTasksByAssignedTo(@PathVariable Long userId) {
        return taskService.getTasksByAssignedTo(userId);
    }

    @GetMapping("/tasks/created/{userId}")
    public List<Task> getTasksByCreatedBy(@PathVariable Long userId) {
        return taskService.getTasksByCreatedBy(userId);
    }

    @GetMapping("/tasks/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @PutMapping("/tasks/{id}")
    public Task updateTask(@RequestBody Task task, @PathVariable Long id) {
        return taskService.updateTask(task, id);
    }

    @GetMapping("/calendar/{userId}")
    public Map<String, Object> getUserCalendar(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);

        List<Task> tasks = taskService.getTasksByAssignedTo(userId);
        List<Appointment> appointments = appointmentService.getAppointmentsByEmployee(userId);

        Map<String, Object> calendar = new HashMap<>();
        calendar.put("tasks", tasks);
        calendar.put("appointments", appointments);

        return calendar;
    }

    // Document management
    @PostMapping("/documents")
    public Document createDocument(@RequestBody Document document,
                                   @RequestParam Long createdById,
                                   @RequestParam(required = false) Long assignedToId) {
        return documentService.createDocument(document, createdById, assignedToId);
    }

    @GetMapping("/documents")
    public List<Document> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/documents/{id}")
    public Document getDocumentById(@PathVariable Long id) {
        return documentService.getDocumentById(id);
    }

    @PutMapping("/documents/{id}")
    public Document updateDocument(@RequestBody Document document, @PathVariable Long id) {
        return documentService.updateDocument(document, id);
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam("fileName") String fileName) {
        try {
            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Save the file
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());

            // Create document record
            Document document = new Document();
            document.setDocumentType(documentType);
            document.setFileName(fileName);
            document.setFilePath(filePath.toString());
            document.setCreatedAt(new Date());

            // Save to database
            documentService.save(document);

            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "File uploaded successfully",
                    "document", document
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to upload file: " + e.getMessage()
            ));
        }
    }

    // Appointment management
    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/appointments/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    @PutMapping("/appointments/{id}")
    public Appointment updateAppointment(@RequestBody Appointment appointment, @PathVariable Long id) {
        return appointmentService.updateAppointment(appointment, id);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Task with id " + id + " has been successfully deleted.");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Appointment with id " + id + " has been successfully deleted.");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Document with id " + id + " has been successfully deleted.");

        return ResponseEntity.ok(response);
    }
}