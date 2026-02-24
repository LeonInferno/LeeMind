package com.smartstudyplanner.backend;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leeai")
@CrossOrigin(origins = "http://localhost:5173")
public class LeeAiController {

    private final ChatClient chatClient;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    // Chat history stored in memory
    private final List<String> history = new ArrayList<>();

    private static final Map<String, String> TOOL_PROMPTS = Map.of(
        "Audio Summary",  "You are an expert content creator. Generate a clear, engaging audio script (spoken-word narration) that summarizes the following content. Use a conversational tone, natural pauses, and make it easy to follow by ear. Format with [INTRO], [MAIN POINTS], and [OUTRO] sections.",
        "Video Summary",  "You are an expert video scriptwriter. Create a storyboard script. Use EXACTLY this format:\n\nSCENE: 1\nVISUAL: [what appears on screen]\nNARRATION: [spoken words]\n\nSCENE: 2\n...\n\nCreate 6-10 scenes covering the content.",
        "Concept Map",    "You are an expert educator. Create a concept map using EXACTLY this format:\n\nROOT: [main topic]\n  BRANCH: [subtopic 1]\n    NODE: [concept]\n    NODE: [concept]\n  BRANCH: [subtopic 2]\n    NODE: [concept]\n    NODE: [concept]\n\nUse indentation (2 spaces) to show hierarchy. Cover all key ideas.",
        "Study Guide",    "You are an expert tutor. Create a comprehensive study guide from the following content. Include: an overview, key concepts with explanations, important definitions, key formulas or rules (if any), and a summary section. Use clear headings and bullet points.",
        "Flashcards",     "You are an expert educator. Generate exactly 10 flashcards. Use EXACTLY this format with no extra text:\n\nCARD: 1\nQ: [question]\nA: [answer]\n\nCARD: 2\nQ: [question]\nA: [answer]\n\nContinue through CARD: 10.",
        "Infographic",    "Create infographic content using EXACTLY this format:\n\nTITLE: [main title]\nSUBTITLE: [one-line subtitle]\n\nSTAT: [label] | [value or short fact]\nSTAT: [label] | [value]\nSTAT: [label] | [value]\n\nSECTION: [section title]\n• [short bullet]\n• [short bullet]\n• [short bullet]\n\nSECTION: [section title]\n• [short bullet]\n• [short bullet]\n\nTAKEAWAY: [one key message]",
        "Slide Deck",     "Create a slide deck. Use EXACTLY this format:\n\nSLIDE: 1\nTITLE: [slide title]\n• [bullet point]\n• [bullet point]\n• [bullet point]\n\nSLIDE: 2\nTITLE: [slide title]\n• [bullet point]\n\nCreate 6-8 slides: title slide, content slides, conclusion.",
        "Key Facts",      "Extract exactly 12 key facts as a numbered list. Use EXACTLY this format:\n\n1. [fact in one clear sentence]\n2. [fact]\n3. [fact]\n\nContinue through 12. Each fact must be self-contained and specific.",
        "Quiz",           "You are an expert quiz maker."
    );

    public LeeAiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {

        // Save user message
        history.add("User: " + message);

        // Combine history into one prompt
        String fullPrompt = String.join("\n", history)
                + "\nAI Tutor: ";

        // Get AI response
        String response = chatClient.prompt(fullPrompt)
                .call()
                .content();

        // Save AI response
        history.add("AI Tutor: " + response);

        return response;
    }

    @PostMapping("/generate")
    public String generate(@RequestBody GenerateRequest request) {
        String toolType = request.getToolType();
        String context = request.getContext();

        // Cap context to ~8000 chars to stay within rate limits
        String safeContext = (context != null && context.length() > 8000)
            ? context.substring(0, 8000) + "\n\n[...content truncated for length...]"
            : context;

        // Build quiz prompt dynamically based on count and type
        String systemPrompt;
        if ("Quiz".equals(toolType)) {
            int count = request.getCount() != null ? request.getCount() : 10;
            String qType = request.getQuestionType() != null ? request.getQuestionType() : "multiple-choice";
            if ("short-answer".equals(qType)) {
                systemPrompt = "You are an expert quiz maker. Generate exactly " + count + " short answer questions. " +
                    "Use EXACTLY this format:\n\nQ: [question text]\nANSWER: [concise answer]\n\nQ: [next question]\nANSWER: [answer]\n\nRepeat for all " + count + " questions.";
            } else {
                systemPrompt = "You are an expert quiz maker. Generate exactly " + count + " multiple choice questions. " +
                    "Use EXACTLY this format:\n\nQ: [question text]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nCORRECT: [A/B/C/D]\n\nQ: [next question]\n...\n\nRepeat for all " + count + " questions.";
            }
        } else {
            systemPrompt = TOOL_PROMPTS.getOrDefault(toolType,
                "You are an expert educator. Process the following content and generate a helpful " + toolType + ".");
        }

        String userPrompt = (safeContext != null && !safeContext.isBlank())
            ? "Here is the content to work with:\n\n" + safeContext
            : "There is no specific content provided. Generate a helpful example " + toolType + " on a general educational topic.";

        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        return response;
    }

    @PostMapping("/audio")
    public ResponseEntity<byte[]> generateAudio(@RequestBody GenerateRequest request) {
        try {
            String context = request.getContext();

            // Step 1: Generate a clean spoken script
            String systemPrompt = "You are an expert narrator. Write a natural, engaging spoken-word summary " +
                "of the following content (2-3 minutes when read aloud, ~400 words max). " +
                "Use plain conversational sentences only — no bullet points, no markdown, no stage directions, " +
                "no text in brackets or parentheses. Just the words to be spoken.";

            // Cap context to ~8000 chars (~2000 tokens) to stay within rate limits
            String safeContext = (context != null && context.length() > 8000)
                ? context.substring(0, 8000) + "\n\n[...content truncated for length...]"
                : context;

            String userPrompt = (safeContext != null && !safeContext.isBlank())
                ? "Summarize this content as a spoken narration:\n\n" + safeContext
                : "Create a short spoken educational summary on an interesting general learning topic.";

            String script = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            if (script == null || script.isBlank()) {
                return ResponseEntity.internalServerError()
                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                        .body("AI returned empty script.".getBytes());
            }

            // Trim to OpenAI TTS 4096-char limit
            if (script.length() > 4000) {
                script = script.substring(0, 4000);
            }

            // Step 2: Call OpenAI TTS API
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + openAiApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                "model", "tts-1",
                "input", script,
                "voice", "nova"
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> ttsResponse = restTemplate.postForEntity(
                "https://api.openai.com/v1/audio/speech",
                entity,
                byte[].class
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"audio-summary.mp3\"")
                    .body(ttsResponse.getBody());

        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body(("OpenAI error: " + e.getResponseBodyAsString()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body(("Server error: " + e.getMessage()).getBytes());
        }
    }
}